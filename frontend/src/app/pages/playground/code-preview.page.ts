import { ChangeDetectionStrategy, Component } from '@angular/core';
import { PiPageHeaderComponent } from '../../shared/page/pi-page-header.component';
import { PiSectionComponent } from '../../shared/page/pi-section.component';
import { PiCodePreviewComponent } from '../../shared/code/pi-code-preview.component';

/**
 * Code Preview playground page (/playground/code) — TZ-78.
 *
 * Showcases 5 highlight.js v11 syntax languages: HTML, TypeScript, CSS,
 * Bash, JSON. All samples are minimal but representative.
 */
@Component({
  selector: 'app-code-preview-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PiPageHeaderComponent, PiSectionComponent, PiCodePreviewComponent],
  template: `
    <app-pi-page-header
      eyebrow="07 · playground · code"
      title="Code Preview"
      subtitle="highlight.js v11 syntax highlighting"
      description="5 languages: HTML, TypeScript, CSS, Bash, JSON. Tree-shake imports, SSR-safe, OKLCH theme."
      version="v0.2"
    />

    <!-- ───── Section I. HTML ───── -->
    <app-pi-section title="HTML" hint="xml language · tag highlighting" eyebrow="I">
      <app-pi-code-preview language="html" fileName="button.component.html" [code]="htmlSample" />
    </app-pi-section>

    <!-- ───── Section II. TypeScript ───── -->
    <app-pi-section
      title="TypeScript"
      hint="typescript language · keyword + type highlighting"
      eyebrow="II"
    >
      <app-pi-code-preview
        language="typescript"
        fileName="pi-select.component.ts"
        [code]="tsSample"
      />
    </app-pi-section>

    <!-- ───── Section III. CSS ───── -->
    <app-pi-section
      title="CSS"
      hint="css language · selector + property highlighting"
      eyebrow="III"
    >
      <app-pi-code-preview language="css" fileName="tokens.css" [code]="cssSample" />
    </app-pi-section>

    <!-- ───── Section IV. Bash ───── -->
    <app-pi-section title="Bash" hint="bash language · command highlighting" eyebrow="IV">
      <app-pi-code-preview language="bash" fileName="dev.sh" [code]="bashSample" />
    </app-pi-section>

    <!-- ───── Section V. JSON ───── -->
    <app-pi-section title="JSON" hint="json language · key + value highlighting" eyebrow="V">
      <app-pi-code-preview language="json" fileName="package.json" [code]="jsonSample" />
    </app-pi-section>
  `,
})
export class CodePreviewPage {
  protected readonly htmlSample = `<button class="btn btn-primary" type="submit">
  <span class="icon">→</span>
  Save changes
</button>

<form (submit)="onSave($event)">
  <input type="email" name="email" required />
</form>`;

  protected readonly tsSample = `import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  inject,
  model,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-pi-select',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => SelectComponent),
    },
  ],
  template: \`<select><ng-content /></select>\`,
})
export class SelectComponent implements ControlValueAccessor {
  readonly value = model<string | null>(null);
  private onChange: (v: string | null) => void = () => {};

  writeValue(v: string | null): void {
    this.value.set(v);
  }

  registerOnChange(fn: (v: string | null) => void): void {
    this.onChange = fn;
  }
}`;

  protected readonly cssSample = `:root {
  --color-paper: oklch(0.972 0.008 85);
  --color-ink:   oklch(0.145 0 0);
  --color-rule:  oklch(0.85 0.006 80);
}

.btn {
  display: inline-flex;
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-rule);
  border-radius: 0.375rem;
  background: var(--color-paper);
  color: var(--color-ink);
  cursor: pointer;
  transition: opacity 150ms ease;
}

.btn-primary {
  background: var(--color-ink);
  color: var(--color-paper);
}

.btn:hover { opacity: 0.85; }`;

  protected readonly bashSample = `#!/usr/bin/env bash
set -euo pipefail

# Install dependencies
pnpm install --frozen-lockfile

# Run dev server in background
pnpm start &
DEV_PID=$!

# Wait for server to be ready
for i in {1..30}; do
  if curl -sf http://localhost:4200/ > /dev/null; then
    echo "Dev server ready"
    break
  fi
  sleep 2
done

# Run smoke tests
pnpm exec playwright test

# Cleanup
kill $DEV_PID`;

  protected readonly jsonSample = `{
  "name": "@paper-and-ink/editor",
  "version": "0.2.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@angular/core": "^20.3.0",
    "highlight.js": "^11.11.0",
    "tailwindcss": "^4.0.0"
  },
  "devDependencies": {
    "typescript": "~5.9.0",
    "vite": "^6.0.0"
  }
}`;
}
