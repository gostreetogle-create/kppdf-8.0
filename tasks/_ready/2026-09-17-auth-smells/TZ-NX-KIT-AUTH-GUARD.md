# TZ-NX-KIT-AUTH-GUARD: protect /kit or document public design-kit

> Evidence: checklist №2 kit layout без authGuard
> **PO decision required before code** (Yes/No). Default recommendation ниже.

**РОЛЬ:** freebuff frontend (+ PO Yes/No)
**ЗАВИСИМОСТИ:** TZ-AUDIT-QA-KIT preferred (classification first)
**SIZE:** S
**PACK:** WAVE-AUTH-SMELLS-2026-09-17
**LAYER:** 3
**PAGES:** /kit ; /kit/overview ; /kit/foundations ; /kit/forms ; /kit/overlays
**PAGE_DOCS:** N/A (design kit)
**CONFLICT KEYS:** frontend-nx/apps/kppdf-web/src/app/app.routes.ts
**IMPLICIT CONFLICT:** nx build kppdf-web

## Domain note
`/kit` — внутренний design kit, не операторский экран цеха.

## PO Yes/No (до кода)
Реализовал бы по умолчанию: **Да — повесить `authGuard` на parent `/kit`** (как остальной app), потому что kit не должен быть публичным вломом без логина на том же origin.
Единственный вопрос: **киту нужен authGuard? Да / Нет (оставить public).**

## ЧТО ДЕЛАТЬ (после Yes)
1. Claim.
2. Добавить `authGuard` на `/kit` parent (и children наследуют).
3. Build · archive.
После **Нет:** закрыть TZ как WONTFIX с note в checklist №2 «PO: public design kit» + archive без code.

## НЕ
Редизайн kit · новые kit pages

## AC
Либо kit за authGuard + build green, либо documented WONTFIX + checklist updated.
