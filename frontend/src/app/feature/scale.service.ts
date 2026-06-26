import { computed, Injectable, signal } from '@angular/core';
import { SCALE_MAX, SCALE_MIN, SCALE_STEP } from './constants';

@Injectable()
export class ScaleService {
  #scale = signal<number>(1);
  public scale = this.#scale.asReadonly();
  #maxNativeWidth = signal<number | null>(null);

  public scaledWidth = computed(() => {
    const initialSize = this.#maxNativeWidth();
    return initialSize !== null ? initialSize * this.scale() : null;
  });
  
  public setMaxNativeWidth(width: number): void {
    const maxNativeWidth = this.#maxNativeWidth();
    if (maxNativeWidth === null || width > maxNativeWidth) {
      this.#maxNativeWidth.set(width);
    }
  }

  public zoomIn(): void {
    this.#scale.update((scale) =>
      scale + SCALE_STEP <= SCALE_MAX ? scale + SCALE_STEP : SCALE_MAX,
    );
  }

  public zoomOut(): void {
    this.#scale.update((scale) =>
      scale - SCALE_STEP >= SCALE_MIN ? scale - SCALE_STEP : SCALE_MIN,
    );
  }
}
