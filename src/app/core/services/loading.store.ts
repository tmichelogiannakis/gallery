import { Service, computed, signal } from '@angular/core';

@Service()
export class LoadingStore {
  private readonly count = signal(0);

  readonly isLoading = computed(() => this.count() > 0);

  start(): void {
    this.count.update((pending) => pending + 1);
  }

  stop(): void {
    this.count.update((pending) => Math.max(0, pending - 1));
  }
}
