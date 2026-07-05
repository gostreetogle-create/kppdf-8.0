#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Paper & Ink TZ patches.

Вносит 2 типа правок в TZ-30..82 (Paper & Ink editorial set):

1. Добавляет недостающие секции [ИСХОДНОЕ СОСТОЯНИЕ] и
   [ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ] в TZ-35..45 (basher-аудит обнаружил блокер).

2. Применяет 3 патча от code-reviewer (TZ-77 ↔ TZ-33 coordination,
   TZ-78 single-pathway, TZ-66 ngx-charts peer-compat).

Использование:
    cd D:/kppdf-8.0 && python _tmp/patch_paper_ink.py
"""

import os
import sys

OS = 'D:/kppdf-8.0'

def read(path):
    with open(path, 'r', encoding='utf-8') as f:
        return f.read()

def write(path, content):
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

# =========================================================================
# BLOCK 1: TZ-35..45 — добавить ИСХОДНОЕ СОСТОЯНИЕ + ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ
# =========================================================================
TZ_FILES = [
    ('TZ-35', 'badge',
     ['frontend/src/app/shared/ui/badge/badge.component.ts',
      'frontend/src/app/shared/ui/badge/index.ts']),
    ('TZ-36', 'card',
     ['frontend/src/app/shared/ui/card/card.component.ts',
      'frontend/src/app/shared/ui/card/index.ts']),
    ('TZ-37', 'input',
     ['frontend/src/app/shared/ui/input/input.component.ts',
      'frontend/src/app/shared/ui/input/index.ts']),
    ('TZ-38', 'textarea',
     ['frontend/src/app/shared/ui/textarea/textarea.component.ts',
      'frontend/src/app/shared/ui/textarea/index.ts']),
    ('TZ-39', 'label',
     ['frontend/src/app/shared/ui/label/label.component.ts']),
    ('TZ-40', 'form-field',
     ['frontend/src/app/shared/ui/form-field/form-field.component.ts',
      'frontend/src/app/shared/ui/form-field/index.ts']),
    ('TZ-41', 'select',
     ['frontend/src/app/shared/ui/select/select.component.ts',
      'frontend/src/app/shared/ui/select/select-trigger.component.ts',
      'frontend/src/app/shared/ui/select/select-option.component.ts',
      'frontend/src/app/shared/ui/select/index.ts']),
    ('TZ-42', 'checkbox',
     ['frontend/src/app/shared/ui/checkbox/checkbox.component.ts',
      'frontend/src/app/shared/ui/checkbox/index.ts']),
    ('TZ-43', 'radio',
     ['frontend/src/app/shared/ui/radio/radio-group.component.ts',
      'frontend/src/app/shared/ui/radio/radio-item.component.ts',
      'frontend/src/app/shared/ui/radio/index.ts']),
    ('TZ-44', 'switch',
     ['frontend/src/app/shared/ui/switch/switch.component.ts',
      'frontend/src/app/shared/ui/switch/index.ts']),
    ('TZ-45', 'slider',
     ['frontend/src/app/shared/ui/slider/slider.component.ts',
      'frontend/src/app/shared/ui/slider/index.ts']),
]

SEP = '═' * 56  # ═══════════════════════════════════════════════════════════════

def ist_block(name):
    """Возвращает блок ИСХОДНОЕ СОСТОЯНИЕ с header'ом."""
    return (
        f'{SEP}\n'
        f'ИСХОДНОЕ СОСТОЯНИЕ\n'
        f'{SEP}\n'
        f'\n'
        f'1. Текущий kppdf-8.0 frontend использует Angular Material\n'
        f'   (`mat-flat-button`, `mat-card`, `mat-input` и т.д.) —\n'
        f'   SaaS-look со shadow, rounded-3xl и gradient fills.\n'
        f'2. Paper & Ink требует hand-rolled примитив с hairline 1px\n'
        f'   border + OKLCH tokens из TZ-32 + signal inputs/outputs API\n'
        f'   (`input()` / `output()`, НЕ `@Input` / `@Output` decorator\'ы).\n'
        f'3. Директория `frontend/src/app/shared/ui/{name}/` пуста или со-\n'
        f'   держит deprecated stub из ранних TZ — в этой TZ удалить и\n'
        f'   заменить на новый standalone OnPush signal-based компонент.\n'
    )

def fayly_block(name, files):
    """Возвращает блок ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ с header'ом."""
    lines = []
    for f in files:
        if f.endswith('index.ts'):
            lines.append(f'  + {f} (СОЗДАТЬ — barrel export)')
        else:
            lines.append(f'  + {f} (СОЗДАТЬ)')
    body = '\n'.join(lines)
    return (
        f'{SEP}\n'
        f'ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ\n'
        f'{SEP}\n'
        f'\n'
        f'ИЗМЕНЯТЬ:\n{body}\n'
        f'\n'
        f'НЕ ИЗМЕНЯТЬ:\n'
        f'  - frontend/src/styles.css (только token utility classes из TZ-32).\n'
        f'  - backend/** (никаких изменений backend в этой TZ).\n'
        f'  - другие ui-primitives (TZ-NN ≠ этот TZ) — не трогать.\n'
    )

patched = []
for tz, name, files in TZ_FILES:
    p = f'tasks/{tz}.md'
    c = read(p)

    # Вставить ИСХОДНОЕ СОСТОЯНИЕ перед ЧТО ДЕЛАТЬ
    if 'ИСХОДНОЕ СОСТОЯНИЕ' not in c and 'ЧТО ДЕЛАТЬ' in c:
        c = c.replace('ЧТО ДЕЛАТЬ', ist_block(name) + 'ЧТО ДЕЛАТЬ', 1)

    # Вставить ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ перед КРИТЕРИИ ПРИЁМКИ
    if 'ФАЙЛЫ ДЛЯ ИЗМЕНЕНИЯ' not in c and 'КРИТЕРИИ ПРИЁМКИ' in c:
        c = c.replace('КРИТЕРИИ ПРИЁМКИ', fayly_block(name, files) + 'КРИТЕРИИ ПРИЁМКИ', 1)

    write(p, c)
    patched.append(tz)

print(f'Блок 1: исправлены {len(patched)} файлов (TZ-35..45):')
for t in patched:
    print(f'  {t}')

# =========================================================================
# BLOCK 2: TZ-77 ↔ TZ-33 coordination — override vars (НЕ перезапись)
# =========================================================================
p77 = 'tasks/TZ-77.md'
c77 = read(p77)
old77 = (
    "        root.style.setProperty('--color-ink',\n"
    "          `oklch(${inkOverrides().lightness}% ${inkOverrides().chroma} ${inkOverrides().hue})`);\n"
    "        root.style.setProperty('--color-paper',\n"
    "          `oklch(${paperOverrides().lightness}% ${paperOverrides().chroma} ${paperOverrides().hue})`);"
)
new77 = (
    "        // NON-DESTRUCTIVE override: TZ-32 base @theme inline value\n"
    "        // remains intact; consumes via var(--color-ink-override, oklch(0.145 0 0)).\n"
    "        root.style.setProperty('--color-ink-override',\n"
    "          `oklch(${inkOverrides().lightness}% ${inkOverrides().chroma} ${inkOverrides().hue})`);\n"
    "        root.style.setProperty('--color-paper-override',\n"
    "          `oklch(${paperOverrides().lightness}% ${paperOverrides().chroma} ${paperOverrides().hue})`);"
)
if old77 in c77:
    write(p77, c77.replace(old77, new77))
    print('Блок 2: TZ-77 — override vars (не overwrite @theme)')
else:
    print('Блок 2: TZ-77 pattern NOT FOUND — requires manual review')

# =========================================================================
# BLOCK 3: TZ-78 single-pathway — убираем директиву + ContentChild
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
    "    Принимает статический source code через `[piCodePreview]=...`\n"
    "    ИЛИ fallback в `<ng-template #code>Сюда писать html</ng-template>`.\n"
    "\n"
    "  Шаг 1.2: Wrapper helper `injectCodeFromTemplate(tpl: TemplateRef)` —\n"
    "  превращает TemplateRef в строку с escaped `<` `>` (через toString\n"
    "  не вариант; используем простой approach: text prop + manual paste)."
)
new78 = (
    "ШАГ 1: SINGLE-PATHWAY only — статический string input. УБРАЛИ\n"
    "  директиву + ContentChild extraction (Angular НЕ даёт API получить\n"
    "  TemplateRef source как string → нужен pre-bake на const-строках):\n"
    "\n"
    "    ```ts\n"
    "    // Demo (TZ-68) вычисляет: demoSource = computed(() => EXAMPLE_BUTTON_HTML)\n"
    "    <app-pi-code-preview [code]=\"demoSource()\" language=\"html\" />\n"
    "    ```\n"
    "  Каждая pages/<name>.page.ts экспортирует EXAMPLE_*_HTML string const."
)
if old78 in c78:
    c78 = c78.replace(old78, new78)
    print('Блок 3а: TZ-78 — single-pathway (string input only)')

# Убираем директиву из CONFLICT KEYS
old78c = (
    "CONFLICT KEYS:\n"
    "  - frontend/src/app/shared/code/pi-code-preview.component.ts\n"
    "  - frontend/src/app/shared/code/code-preview.directive.ts\n"
    "  - frontend/src/app/shared/code/index.ts"
)
new78c = (
    "CONFLICT KEYS:\n"
    "  - frontend/src/app/shared/code/pi-code-preview.component.ts\n"
    "  - frontend/src/app/shared/code/index.ts"
)
if old78c in c78:
    c78 = c78.replace(old78c, new78c)
    print('Блок 3б: TZ-78 — CONFLICT KEYS cleaned (no unused directive)')
write(p78, c78)

# =========================================================================
# BLOCK 4: TZ-66 ngx-charts peer-compat precondition
# =========================================================================
p66 = 'tasks/TZ-66.md'
c66 = read(p66)
old66 = "ШАГ 1: Создать `pi-chart.component.ts` (обёртка-конфигуратор)."
new66 = (
    "ШАГ 1: PRECONDITION — проверить ngx-charts peer-compat на Angular 18:\n"
    "    ```bash\n"
    "    pnpm view @swimlane/ngx-charts@20 peerDependencies\n"
    "    ```\n"
    "    Если `@angular/core` peer совместим с ^18 → продолжаем ниже.\n"
    "    Если ngx-charts v20 pin = `^17.x.x` СТРОГОЙ → либо downgrade\n"
    "    до `@swimlane/ngx-charts@~17.x`, либо альтернативы:\n"
    "      - `chartist` (esm light),\n"
    "      - hand-roll D3 (`pnpm add d3@^7`),\n"
    "      - Apex-Charts.\n"
    "    Перед продолжением ЗАПИСАТЬ проверку в progress.md.\n"
    "\n"
    "  Шаг 1.1: Создать `pi-chart.component.ts` (обёртка-конфигуратор)."
)
if old66 in c66:
    write(p66, c66.replace(old66, new66))
    print('Блок 4: TZ-66 — ngx-charts peer-compat precondition added')
else:
    print('Блок 4: TZ-66 pattern NOT FOUND — manual review needed')

print(f'{SEP}')
print('ВСЕ ПАТЧИ ПРИМЕНЕНЫ. Готово к передаче агенту по TZ-30 первого.')
