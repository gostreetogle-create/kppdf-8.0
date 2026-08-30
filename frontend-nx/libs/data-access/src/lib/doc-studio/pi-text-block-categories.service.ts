import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL, silentGet, type SilentResult } from '@kppdf/util-http';
import type { TextBlockCategory } from './text-block.types';

@Injectable({ providedIn: 'root' })
export class PiTextBlockCategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);
  list(): Observable<SilentResult<TextBlockCategory[]>> {
    return silentGet<TextBlockCategory[]>(this.http, `${this.baseUrl}/text-block-categories`);
  }
}
