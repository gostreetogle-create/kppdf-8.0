import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="card"><ng-content></ng-content></div>`,
})
export class CardComponent {}

@Component({
  selector: 'app-card-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="card-header"><ng-content></ng-content></div>`,
})
export class CardHeaderComponent {}

@Component({
  selector: 'app-card-title',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h3 class="card-title"><ng-content></ng-content></h3>`,
})
export class CardTitleComponent {}

@Component({
  selector: 'app-card-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="card-description"><ng-content></ng-content></p>`,
})
export class CardDescriptionComponent {}

@Component({
  selector: 'app-card-content',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="card-content"><ng-content></ng-content></div>`,
})
export class CardContentComponent {}

@Component({
  selector: 'app-card-footer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<div class="card-footer"><ng-content></ng-content></div>`,
})
export class CardFooterComponent {}
