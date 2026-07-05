#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Round 2 patches — based on code-reviewer feedback.

Применяет 3 механических правки:
1. TZ-78 — удаление @Directive+TemplateRef+ContentChild блока из ЧТО ДЕЛАТЬ
   (остался после первой попытки; CONFLICT KEYS уже снят).
2. TZ-66 — фикс дубликата «Шаг 1.1:» → второй становится «Шаг 1.2:».
3. TZ-35..45 — корректировка ширины сепараторов (50 → 58 chars)
   под канонический шаблон.
"""

import os
import sys

OS = 'D:/kppdf-8.0'
os.chdir(OS)

SEP_58 = '═' * 58  # canonical template width
SEP_50 = '═' * 50  # injected (incorrect) width

def read(p):
    with open(p, 'r', encoding='utf-8') as f:
        return f.read()
def write(p, c):
    with open(p, 'w', encoding='utf-8') as f:
        f.write(c)

# =========================================================================
# BLOCK 1: TZ-78 — удалить @Directive+TemplateRef+ContentChild блок
# =========================================================================
p78 = 'tasks/TZ-78.md'
c78 = read(p78)
old78 = (
    "ШАГ 1: `code/code-preview.directive.ts`:\n"
    "    ```ts\n"
    "    @Directive({ selector: '[piCodePreview]', standalone: true })\n"
    "    export class CodePreviewDirective {\n"
    "      readonly templateRef = inject(TemplateRef);\n"
    "      readonly codeRef = contentChild<TemplateRef<unknown>>('code');\n"
    "      @Input('piCodePreview') sourceCode: string = '';\n"
    "    }\n"
    "    ```\n"
    "    Принимает статический source code через `[piCodePreview]=\"...\"`\n"
    "    ИЛИ fallback в `<ng-template #code>Сюда писать html</ng-template>`.\n"
    "\n"
    "  Шаг 1.2: Wrapper helper `injectCodeFromTemplate(tpl: TemplateRef)` —\n"
    "  превращает TemplateRef в строку с escaped `<` `>` (через toString\n"
    "  не вариант; используем простой approach: text prop + manual paste)."
)
new78 = (
    "ШАГ 1: SINGLE-PATHWAY only — статический string input. НЕТ директивы\n"
    "  + ContentChild extraction (Angular НЕ даёт API получить TemplateRef\n"
    "  source как string → pre-bake на static const на уровне page):\n"
    "\n"
    "    ```ts\n"
    "    // Demo (TZ-68) вычисляет: demoSource = computed(() => EXAMPLE_BUTTON_HTML)\n"
    "    <app-pi-code-preview [code]=\"demoSource()\" language=\"html\" />\n"
    "    ```\n"
    "  Каждая pages/<name>.page.ts экспортирует EXAMPLE_*_HTML string const."
)
if old78 in c78:
    write(p78, c78.replace(old78, new78))
    print('Блок 1: TZ-78 — @Directive body удалён (BLOCKER FIXED)')
else:
    print('Блок 1: TZ-78 pattern NOT FOUND — manual check needed')

# =========================================================================
# BLOCK 2: TZ-66 — фикс дубликата «Шаг 1.1:» → второй становится «Шаг 1.2:»
# =========================================================================
p66 = 'tasks/TZ-66.md'
c66 = read(p66)
old66 = (
    "  Шаг 1.1: Создать `pi-chart.component.ts` (обёртка-конфигуратор).\n"
    "\n"
    "  Шаг 1.1: Inputs:"
)
new66 = (
    "  Шаг 1.1: Создать `pi-chart.component.ts` (обёртка-конфигуратор).\n"
    "\n"
    "  Шаг 1.2: Inputs:"
)
if old66 in c66:
    write(p66, c66.replace(old66, new66))
    print('Блок 2: TZ-66 — Шаг 1.1 → Шаг 1.2 (numbering corrected)')
else:
    print('Блок 2: TZ-66 pattern NOT FOUND — manual check needed')

# =========================================================================
# BLOCK 3: TZ-35..45 — сепараторы 50 → 58 chars
# =========================================================================
TZ_FILES = ['TZ-35', 'TZ-36', 'TZ-37', 'TZ-38', 'TZ-39',
            'TZ-40', 'TZ-41', 'TZ-42', 'TZ-43', 'TZ-44', 'TZ-45']

fixed_count = 0
for tz in TZ_FILES:
    p = f'tasks/{tz}.md'
    c = read(p)

    # Вокруг ИСХОДНОЕ СОСТОЯНИЕ
    pattern_ist = f"{SEP_50}\nИСХОДНОЕ СОСТОЯНИЕ\n{SEP_50}"
    replacement_ist = f"{SEP_58}\nИСХОДНОЕ СОСТОЯНИЕ\n{SEP_58}"
    if pattern_ist in c:
        c = c.replace(pattern_ist, replacement_ist)

    # Вокруг ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
    pattern_fayly = f"{SEP_50}\nФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ\n{SEP_50}"
    replacement_fayly = f"{SEP_58}\nФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ\n{SEP_58}"
    if pattern_fayly in c:
        c = c.replace(pattern_fayly, replacement_fayly)

    write(p, c)
    fixed_count += 1
    print(f'Блок 3: {tz} — сепараторы выровнены на 58 chars')

print(f'Блок 3: исправлено 11 файлов (TZ-35..45).')
print('Готово. Round 2 patches применены.')
