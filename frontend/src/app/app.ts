import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PiToastComponent } from './shared/ui/toast';
import { PiCommandPaletteComponent } from './shared/command';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, PiToastComponent, PiCommandPaletteComponent],
  template: `
    <router-outlet />
    <app-pi-toast-host />
    <app-pi-command-palette />
  `,
})
export class App {}
