import { Directive, ElementRef, HostListener, inject, input, Renderer2 } from '@angular/core';
import { PageView } from './page-view/page-view';
import { Annotation } from './interfaces';
import { setupMouseDrag, toNatural, toRelative } from './page-view/utils';

@Directive({
  selector: '[appAnnotationMove]',
})
export class AnnotationMoveDirective {
  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);
  private pageView = inject(PageView);

  annotation = input.required<Annotation>({ alias: 'appAnnotationMove' });

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    event.stopPropagation();
    const bounds = this.pageView.getHostBounds();

    setupMouseDrag(this.renderer, (moveEvent: MouseEvent) => {
      const relativeX = toRelative(moveEvent.clientX, bounds.left, bounds.width, event.offsetX);
      const relativeY = toRelative(moveEvent.clientY, bounds.top, bounds.height, event.offsetY);

      this.annotation().relativeX.set(relativeX);
      this.annotation().relativeY.set(relativeY);
      this.annotation().naturalX = toNatural(relativeX, this.pageView.naturalWidth);
      this.annotation().naturalY = toNatural(relativeY, this.pageView.naturalHeight);
    });
  }
}
