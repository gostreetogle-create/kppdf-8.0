import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private readonly count = signal(0);
  readonly isLoading = this.count.asReadonly();

  inc(): void {
    this.count.update((c) => c + 1);
  }

  dec(): void {
    this.count.update((c) => Math.max(0, c - 1));
  }
}
