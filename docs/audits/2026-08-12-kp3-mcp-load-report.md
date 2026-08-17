# KP3 → KP8 load report (MIG-302 scoped)

> Дата: 2026-08-12 · Target SoT: `http://192.168.1.103:3000` (Synology LAN = prod Mongo)
> Cursor `user-kppdf` MCP discovery was down; Desktop was paired to `127.0.0.1:3000`.
> Load used the **same REST** endpoints MCP tools wrap (admin JWT). No wipe/deploy.
> Resume runs: throttle 429 → backoff; long `name` truncated to 256; quotation payload without `total`; `organizationId` from `/api/organizations`.
>
> **Closeout 2026-08-17:** TZ-MIG-302 archived DONE (docs-only). Mass re-load **не** выполнялся; MCP :9743 offline; Synology readback timeout. SoT counts ниже — из load 2026-08-12 + id-map.

## Final SoT (readback + id-map)

| Axis | On prod | Notes |
|------|---------|--------|
| Products | **699** | 100% of KP3 dump |
| Counterparties | **16** | +1 `isOurCompany` → organizationCandidates (not CP) |
| Categories | **13** | product categories |
| Quotations (draft) | **27** KP3 mapped (+1 probe `MIG302 probe`) | 1 KP3 empty-items skipped |
| id-map | `data/from-kp3/id-map.json` | products 699 / cps 16 / kps 27 |

## Known skips / fails (acceptable for scoped MIG-302)

| Axis | Count | Reason |
|------|-------|--------|
| Counterparties | 5 | `INN checksum is invalid` (KP3 dirty data) |
| Counterparties | 1 | missing INN |
| Quotations | 1 | KP3 doc with `items: []` (empty) |
| Deferred | — | photoIds / CP.email / branding (gap-block) |

## Deferred (gap-block)

- photoIds (TZD-47/MIG-303)
- Counterparty.email (MIG-304)
- branding (MIG-305 PARK)

## Samples

```json
{
  "products": [
    {
      "sku": "ГТ012",
      "id": "6a7cdf0d2db898d9bdcfdae4"
    },
    {
      "sku": "PR0001",
      "id": "6a7cdf0d2db898d9bdcfdae9"
    },
    {
      "sku": "PR0002",
      "id": "6a7cdf0e2db898d9bdcfdaee"
    }
  ],
  "quotations": [
    "6a7cdf0f2db898d9bdcfdb12"
  ]
}
```

## Readback

```json
{
  "products": {
    "status": 200,
    "total": 699
  },
  "counterparties": {
    "status": 200,
    "total": 16
  },
  "quotations": {
    "status": 200,
    "total": null
  }
}
```

## Failures (truncated)

```json
{
  "categories": [],
  "counterparties": [
    {
      "kp3Id": "69e86f9933d9e3ff185e7af9",
      "status": 400,
      "body": {
        "statusCode": 400,
        "timestamp": "2026-08-12T21:01:01.579Z",
        "path": "/api/counterparties",
        "method": "POST",
        "message": "INN checksum is invalid"
      }
    },
    {
      "kp3Id": "69e86f9933d9e3ff185e7afc",
      "status": 400,
      "body": {
        "statusCode": 400,
        "timestamp": "2026-08-12T21:01:01.609Z",
        "path": "/api/counterparties",
        "method": "POST",
        "message": "INN checksum is invalid"
      }
    },
    {
      "kp3Id": "69e86f9933d9e3ff185e7aff",
      "status": 400,
      "body": {
        "statusCode": 400,
        "timestamp": "2026-08-12T21:01:01.643Z",
        "path": "/api/counterparties",
        "method": "POST",
        "message": "INN checksum is invalid"
      }
    },
    {
      "kp3Id": "69e86f9933d9e3ff185e7b02",
      "status": 400,
      "body": {
        "statusCode": 400,
        "timestamp": "2026-08-12T21:01:01.672Z",
        "path": "/api/counterparties",
        "method": "POST",
        "message": "INN checksum is invalid"
      }
    },
    {
      "kp3Id": "6a34f0148b02a5e6d428659c",
      "status": 400,
      "body": {
        "statusCode": 400,
        "timestamp": "2026-08-12T21:01:01.703Z",
        "path": "/api/counterparties",
        "method": "POST",
        "message": "INN checksum is invalid"
      }
    },
    {
      "kp3Id": "6a34f86d8b02a5e6d4286658",
      "reason": "bad/missing inn",
      "inn": ""
    }
  ],
  "products": [],
  "quotations": [
    {
      "kp3Id": "6a16e46c8b02a5e6d4285e0d",
      "reason": "no mapped product lines"
    }
  ]
}
```

Id-map: `data/from-kp3/id-map.json` (gitignore).

Organization candidates from isOurCompany (not loaded as Counterparty):
```json
[
  {
    "kp3Id": "69e86f9933d9e3ff185e7b08",
    "name": "ООО \"СпортИН-ЮГ\""
  }
]
```