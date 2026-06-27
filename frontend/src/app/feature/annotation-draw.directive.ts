import { Directive, ElementRef, HostListener, Injector, inject, Renderer2 } from '@angular/core';
import { PageView } from './page-view/page-view';
import { createAnnotation, setupMouseDrag, toNatural, toRelative } from './page-view/utils';

@Directive({
  selector: '[appAnnotationDraw]',
})
export class AnnotationDrawDirective {
  private renderer = inject(Renderer2);
  private elementRef = inject(ElementRef);
  private injector = inject(Injector);

  private get pageView(): PageView {
    return this.injector.get(PageView) as PageView;
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    const pageView = this.pageView;
    if (!pageView) return;

    const hostEl = this.elementRef.nativeElement as HTMLElement;
    if (event.target !== hostEl) return;
    event.preventDefault();

    const bounds = hostEl.getBoundingClientRect();
    const relativeX = toRelative(event.clientX, bounds.left, bounds.width);
    const relativeY = toRelative(event.clientY, bounds.top, bounds.height);

    const annotation = createAnnotation(
      'text', relativeX, relativeY,
      pageView.naturalWidth, pageView.naturalHeight,
    );
    pageView.addAnnotation(annotation);

    setupMouseDrag(this.renderer, (moveEvent: MouseEvent) => {
      const relW = toRelative(moveEvent.clientX, bounds.left, bounds.width) - relativeX;
      const relH = toRelative(moveEvent.clientY, bounds.top, bounds.height) - relativeY;
      annotation.relativeWidth.set(relW);
      annotation.relativeHeight.set(relH);
      annotation.naturalWidth = toNatural(relW, pageView.naturalWidth);
      annotation.naturalHeight = toNatural(relH, pageView.naturalHeight);
    });
  }
}
