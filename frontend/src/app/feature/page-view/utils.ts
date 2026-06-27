import { Renderer2, signal } from '@angular/core';
import { Annotation, AnnotationType } from '../interfaces';

export function toRelative(clientPos: number, boundsStart: number, boundsSize: number, offset = 0): number {
  return ((clientPos - boundsStart - offset) * 100) / boundsSize;
}

export function toNatural(relative: number, naturalSize: number): number {
  return (naturalSize * relative) / 100;
}

export function createAnnotation(
  type: AnnotationType,
  relativeX: number,
  relativeY: number,
  naturalWidth: number,
  naturalHeight: number,
): Annotation {
  return {
    id: Date.now(),
    type,
    relativeX: signal(relativeX),
    relativeY: signal(relativeY),
    relativeWidth: signal(0),
    relativeHeight: signal(0),
    naturalX: toNatural(relativeX, naturalWidth),
    naturalY: toNatural(relativeY, naturalHeight),
    naturalWidth: 0,
    naturalHeight: 0,
    value: signal(''),
  };
}

export function setupMouseDrag(
  renderer: Renderer2,
  onMove: (event: MouseEvent) => void,
  onEnd?: () => void,
): void {
  const unsubMove = renderer.listen('document', 'mousemove', onMove);
  const unsubUp = renderer.listen('document', 'mouseup', () => {
    unsubMove();
    unsubUp();
    onEnd?.();
  });
}
