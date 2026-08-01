#!/usr/bin/env bash
# smoke-idempotency.sh — runtime regression harness for TZ-247 IdempotencyMiddleware.
#
# Verifies three end-to-end invariants that the unit spec cannot catch on its own:
#
#   1. Replay:    POST /api/document-templates twice with the same Idempotency-Key
#                 + body. Both calls return HTTP 201 with the SAME Mongo _id.
#                 The middleware must short-circuit the controller on replay.
#
#   2. Conflict:  POST the same key with a MUTATED body. Must return HTTP 409
#                 with `code: IDEMPOTENCY_KEY_REUSED`.
#
#   3. DB count:  After replay (POST 2), Mongo must contain EXACTLY ONE
#                 document with that _id (NOT two). This is the critical
#                 proof that the middleware replayed instead of re-creating:
#                 identical response bodies alone do not prove "POST 2 was a
#                 pure middleware replay" — only DB state can.
#
# Usage:
#   BASE_URL=http://127.0.0.1:3000 ./scrips/smoke-idempotency.sh
#
# Exit codes:
#   0  all assertions PASS, Mongo state confirmed, cleanup OK
#   1  any assertion FAIL or cleanup error
#
# Requires: docker (for `docker exec kppdf-mongo mongosh`), curl, grep/sed.
# Assumes: backend booted on $BASE_URL with MONGODB_URI pointed at
#          kppdf-db container (docker compose default).

set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3000}"
ADMIN_USER="${ADMIN_USER:-admin}"
ADMIN_PASS="${ADMIN_PASS:-admin123}"
DB="${DB:-kppdf}"
MONGO_CONTAINER="${MONGO_CONTAINER:-kppdf-mongo}"
KEY="$(date +%s%N)-$$"
NAME_B1="SmokeIdemp-$$-B1"
NAME_B2="SmokeIdemp-$$-B2-MUTATED"

# ----- ANSI helpers --------------------------------------------------------
G='\033[0;32m'; R='\033[0;31m'; Y='\033[0;33m'; N='\033[0m'
PASS() { printf "${G}PASS${N} %s\n" "$1"; }
FAIL() { printf "${R}FAIL${N} %s\n" "$1"; FAILED=1; }
INFO() { printf "${Y}>>>${N}  %s\n" "$1"; }
FAILED=0

# ----- helpers -------------------------------------------------------------
# Strip `ObjectId('...')` wrapper printed by mongosh.
hex() { echo "$1" | grep -oE '[0-9a-f]{24}' | head -1; }

# mongosh one-liner that updates Mongo state and prints a single value.
m_eval() {
  docker exec "$MONGO_CONTAINER" mongosh --quiet "$DB" --eval "$1" 2>&1 \
    | tr -d '\r' | head -1 | hex
}

# Count documents matching a filter on collection $1.
count_docs() {
  docker exec "$MONGO_CONTAINER" mongosh --quiet "$DB" --eval "
    print(db.${1}.countDocuments(${2}));
  " 2>&1 | tr -d '\r' | head -1
}

# ----- STEP 1: seed org + doc_type (idempotent) ---------------------------
INFO "STEP 1 — ensuring test org + doc_type exist in Mongo"
ORG_ID="$(m_eval '
  let id = db.organizations.findOne({},{_id:1})?._id;
  if (!id) {
    db.organizations.insertOne({_id:ObjectId(),name:"smoke-org",createdAt:new Date()});
    id = db.organizations.findOne({},{_id:1})._id;
  }
  print(id);
')"
DOCTYPE_ID="$(m_eval '
  let id = db.doc_types.findOne({},{_id:1})?._id;
  if (!id) {
    db.doc_types.insertOne({_id:ObjectId(),name:"smoke-doctype",createdAt:new Date()});
    id = db.doc_types.findOne({},{_id:1})._id;
  }
  print(id);
')"
[ -n "$ORG_ID" ]    || { FAIL "ORG_ID extraction failed"; exit 1; }
[ -n "$DOCTYPE_ID" ] || { FAIL "DOCTYPE_ID extraction failed"; exit 1; }
INFO "ORG_ID=$ORG_ID  DOCTYPE_ID=$DOCTYPE_ID"

# ----- STEP 2: login ---------------------------------------------------
INFO "STEP 2 — login as $ADMIN_USER at $BASE_URL"
LOGIN_RESP="$(curl -sS \
  -H 'Content-Type: application/json' \
  -d "{\"username\":\"$ADMIN_USER\",\"password\":\"$ADMIN_PASS\"}" \
  "${BASE_URL}/api/auth/login")"
TOKEN="$(echo "$LOGIN_RESP" | grep -oE '"(access|accessToken)":"[^"]*"' \
  | head -1 | sed 's/.*":"//;s/"$//')"
[ -n "$TOKEN" ] || { FAIL "login token extraction (no 'access' / 'accessToken')"; \
  echo "raw: $LOGIN_RESP" >&2; exit 1; }
INFO "TOKEN_LEN=${#TOKEN}"

# helper for POST with auth + idempotency-key
post_doc_template() {
  curl -sS -w '\n__HTTP__%{http_code}' \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Idempotency-Key: ${KEY}" \
    -d "$1" \
    "${BASE_URL}/api/document-templates"
}

# ----- STEP 3: POST 1 — create ----------------------------------------
INFO "STEP 3 — POST 1 (key=$KEY, body name=$NAME_B1, expect 201 + _id)"
BODY_B1='{"name":"'"$NAME_B1"'","description":"first call","organizationId":"'"$ORG_ID"'","docTypeId":"'"$DOCTYPE_ID"'"}'
RES1="$(post_doc_template "$BODY_B1")"
HTTP1="$(echo "$RES1" | sed -n 's/^__HTTP__//p')"
BODY1="$(echo "$RES1" | sed '/^__HTTP__/d')"
ID1="$(echo "$BODY1" | grep -oE '"_id":"[^"]+"' | head -1 | sed 's/"_id":"//;s/"$//')"
[ "$HTTP1" = "201" ] && PASS "POST 1 → HTTP 201" || { FAIL "POST 1 → HTTP $HTTP1 (expected 201)"; echo "$BODY1"; }
[ -n "$ID1" ]      && PASS "POST 1 → _id=$ID1" || FAIL "POST 1 → no _id"

# ----- STEP 4: DB count probe #1 ---------------------------------------
INFO "STEP 4 — DB count probe (after POST 1): documents with name=$NAME_B1 expect 1"
COUNT_AFTER_1="$(count_docs document_templates '{name:"'"$NAME_B1"'"}')"
[ "$COUNT_AFTER_1" = "1" ] \
  && PASS "DB count after POST 1 = $COUNT_AFTER_1 (expected 1)" \
  || FAIL "DB count after POST 1 = $COUNT_AFTER_1 (expected 1) — POST 1 may have mis-created"

# ----- STEP 5: POST 2 — replay -----------------------------------------
INFO "STEP 5 — POST 2 (same key, same body, expect 201 + same _id as POST 1)"
RES2="$(post_doc_template "$BODY_B1")"
HTTP2="$(echo "$RES2" | sed -n 's/^__HTTP__//p')"
BODY2="$(echo "$RES2" | sed '/^__HTTP__/d')"
ID2="$(echo "$BODY2" | grep -oE '"_id":"[^"]+"' | head -1 | sed 's/"_id":"//;s/"$//')"
[ "$HTTP2" = "201" ]     && PASS "POST 2 → HTTP 201" || { FAIL "POST 2 → HTTP $HTTP2 (expected 201)"; echo "$BODY2"; }
[ -n "$ID2" ]            && PASS "POST 2 → _id=$ID2" || FAIL "POST 2 → no _id"
[ "$ID2" = "$ID1" ]      && PASS "REPLAY → ID1==ID2 (same _id)" || { FAIL "REPLAY FAIL: ID1=$ID1  ID2=$ID2"; }

# ----- STEP 6: DB count probe #2 (the critical one) --------------------
INFO "STEP 6 — DB count probe (after POST 2): documents with _id=$ID1 MUST STILL = 1"
COUNT_AFTER_2="$(count_docs document_templates '{_id:ObjectId("'"$ID1"'")}' )"
[ "$COUNT_AFTER_2" = "1" ] \
  && PASS "DB count after POST 2 = $COUNT_AFTER_2 (expected 1 — replay did NOT re-create)" \
  || FAIL "DB count after POST 2 = $COUNT_AFTER_2 (expected 1) — POST 2 created a duplicate Mongo doc"

# ----- STEP 7: POST 3 — mismatched body → 409 --------------------------
INFO "STEP 7 — POST 3 (same key, mutated body name=$NAME_B2, expect 409 IDEMPOTENCY_KEY_REUSED)"
BODY_B2='{"name":"'"$NAME_B2"'","description":"changed","organizationId":"'"$ORG_ID"'","docTypeId":"'"$DOCTYPE_ID"'"}'
RES3="$(post_doc_template "$BODY_B2")"
HTTP3="$(echo "$RES3" | sed -n 's/^__HTTP__//p')"
BODY3="$(echo "$RES3" | sed '/^__HTTP__/d')"
[ "$HTTP3" = "409" ] \
  && PASS "POST 3 → HTTP 409 (IDEMPOTENCY_KEY_REUSED)" \
  || FAIL "POST 3 → HTTP $HTTP3 (expected 409) — body: $BODY3"
echo "$BODY3" | grep -q 'IDEMPOTENCY_KEY_REUSED' \
  && PASS "POST 3 body has IDEMPOTENCY_KEY_REUSED code" \
  || FAIL "POST 3 body missing IDEMPOTENCY_KEY_REUSED code"

# ----- STEP 8: DB count probe #3 (no new doc under mutated name) -------
INFO "STEP 8 — DB count probe (after POST 3): documents with name=$NAME_B2 must be 0"
COUNT_AFTER_3="$(count_docs document_templates '{name:"'"$NAME_B2"'"}')"
[ "$COUNT_AFTER_3" = "0" ] \
  && PASS "DB count after POST 3 = $COUNT_AFTER_3 (expected 0 — conflict did NOT create a doc)" \
  || FAIL "DB count after POST 3 = $COUNT_AFTER_3 (expected 0) — 409 conflict leaked a doc"

# ----- STEP 9: cleanup -------------------------------------------------
INFO "STEP 9 — cleanup (remove smoke test document + idempotency record)"
m_eval "db.document_templates.deleteOne({_id:ObjectId('$ID1')})" >/dev/null \
  && PASS "deleted document_templates _id=$ID1" \
  || FAIL "failed to delete document_templates _id=$ID1"
m_eval "db.idempotency_records.deleteOne({idempotencyKey:'$KEY'})" >/dev/null \
  && PASS "deleted idempotency_records key=$KEY" \
  || FAIL "failed to delete idempotency_records key=$KEY"

# ----- summary ---------------------------------------------------------
printf "\n${Y}===== SMOKE-IDEMPOTENCY SUMMARY =====${N}\n"
if [ "$FAILED" = "0" ]; then
  printf "${G}ALL PASS${N}: replay + conflict + DB-count invariants held\n"
  exit 0
else
  printf "${R}FAILURES${N}: see RED lines above\n"
  exit 1
fi
