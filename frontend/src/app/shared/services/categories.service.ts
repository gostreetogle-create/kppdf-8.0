import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api.tokens';
import { silentGet, silentPost, silentPatch, silentDelete, SilentResult } from '../../core/silent-http';

export interface Category {
  _id: string;
  name: string;
  slug: string;
  type: 'material' | 'product' | 'general';
  parentId?: string;
  fullPath?: string;
  skuPrefix: string;
  sortOrder: number;
  isActive: boolean;
  description?: string;
}

export interface CategoryTreeNode extends Category {
  children: CategoryTreeNode[];
}

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  list(type?: string): Observable<SilentResult<Category[]>> {
    let httpParams = new HttpParams();
    if (type) httpParams = httpParams.set('type', type);
    return silentGet<Category[]>(this.http, `${this.baseUrl}/categories`, { params: httpParams });
  }

  tree(type?: string): Observable<SilentResult<CategoryTreeNode[]>> {
    let httpParams = new HttpParams();
    if (type) httpParams = httpParams.set('type', type);
    return silentGet<CategoryTreeNode[]>(this.http, `${this.baseUrl}/categories/tree`, { params: httpParams });
  }

  findById(id: string): Observable<SilentResult<Category>> {
    return silentGet<Category>(this.http, `${this.baseUrl}/categories/${id}`);
  }

  create(payload: Partial<Category>): Observable<SilentResult<Category>> {
    return silentPost<Category>(this.http, `${this.baseUrl}/categories`, payload);
  }

  update(id: string, payload: Partial<Category>): Observable<SilentResult<Category>> {
    return silentPatch<Category>(this.http, `${this.baseUrl}/categories/${id}`, payload);
  }

  remove(id: string): Observable<SilentResult<void>> {
    return silentDelete<void>(this.http, `${this.baseUrl}/categories/${id}`);
  }

  reorder(categoryIds: string[]): Observable<SilentResult<Category[]>> {
    return silentPost<Category[]>(
      this.http,
      `${this.baseUrl}/categories/reorder`,
      { categoryIds },
    );
  }

  reorderChildren(parentId: string | null, childIds: string[]): Observable<SilentResult<Category[]>> {
    return silentPost<Category[]>(
      this.http,
      `${this.baseUrl}/categories/reorder-children`,
      { parentId, childIds },
    );
  }
}
