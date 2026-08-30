import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import type { StudioBlock } from '@kppdf/data-access';

@Component({ selector:'pi-studio-properties-panel', standalone:true, changeDetection:ChangeDetectionStrategy.OnPush, template:`<section class="properties" data-test="studio-properties-panel"><h2>Свойства</h2>@if (block; as selected) {<p>Тип: {{ selected.type }}</p><p>Название: {{ selected.title || 'Текст' }}</p><p>z-index: {{ selected.layout?.zIndex ?? 0 }}</p>} @else {<p>Выберите блок</p>}</section>`, styles:[`.properties{padding:16px}`] })
export class StudioPropertiesPanelComponent { @Input() block: StudioBlock | null = null; }
