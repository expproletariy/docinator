import { Component, ElementRef, inject, input, OnInit, Renderer2, signal, WritableSignal } from '@angular/core';
import { PageModel } from '../../api/document-api.interfaces';
import { ViewerService } from '../viewer.service';
import { FormsModule } from '@angular/forms';
import { Annotation, AnnotationType } from '../interfaces';
import { toRelative, toNatural } from './utils';
import { ScaleService } from '../scale.service';

@Component({
  selector: 'app-page-view',
  templateUrl: './page-view.html',
  styleUrl: './page-view.scss',
  host: {
    '(mousedown)': 'startAddAnnotation($event)',
  },
  imports: [FormsModule],
})
export class PageView implements OnInit {
  private viewerService = inject(ViewerService);
  private scaleService = inject(ScaleService);
  private elementRef = inject(ElementRef);
  private renderer = inject(Renderer2);

  public page = input.required<PageModel>();

  protected annotations?: WritableSignal<Annotation[]>;

  private naturalWidth = 0;
  private naturalHeight = 0;

  ngOnInit(): void {
    this.annotations = this.viewerService.annotationsByPage.get(this.page().number);
  }

  protected onPageLoaded(img: HTMLImageElement): void {
    this.naturalWidth = img.naturalWidth;
    this.naturalHeight = img.naturalHeight;
    this.scaleService.setMaxNativeWidth(img.naturalWidth);
  }

  protected startAddAnnotation(downEvent: MouseEvent): void {
    const hostEl = this.elementRef.nativeElement as HTMLElement;

    if (downEvent.target !== hostEl) return;

    downEvent.preventDefault();

    const bounds = hostEl.getBoundingClientRect();
    const relativeX = toRelative(downEvent.clientX, bounds.left, bounds.width);
    const relativeY = toRelative(downEvent.clientY, bounds.top, bounds.height);
    const annotation = this.makeAnnotation('text', relativeX, relativeY);

    this.annotations?.update((annotations) => [...annotations, annotation]);

    this.handleMouseMove((moveEvent: MouseEvent) => {
      const relativeWidth = toRelative(moveEvent.clientX, bounds.left, bounds.width) - relativeX;
      const relativeHeight = toRelative(moveEvent.clientY, bounds.top, bounds.height) - relativeY;

      annotation.relativeWidth.set(relativeWidth);
      annotation.relativeHeight.set(relativeHeight);
      annotation.naturalWidth = toNatural(relativeWidth, this.naturalWidth);
      annotation.naturalHeight = toNatural(relativeHeight, this.naturalHeight);
    });
  }

  protected startMoveAnnotation(downEvent: MouseEvent, annotation: Annotation): void {
    const hostEl = this.elementRef.nativeElement as HTMLElement;
    const bounds = hostEl.getBoundingClientRect();

    this.handleMouseMove((moveEvent: MouseEvent) => {
      const relativeX = toRelative(moveEvent.clientX, bounds.left, bounds.width, downEvent.offsetX);
      const relativeY = toRelative(moveEvent.clientY, bounds.top, bounds.height, downEvent.offsetY);

      annotation.relativeX.set(relativeX);
      annotation.relativeY.set(relativeY);
      annotation.naturalX = toNatural(relativeX, this.naturalWidth);
      annotation.naturalY = toNatural(relativeY, this.naturalHeight);
    });
  }

  protected deleteNote(idx: number): void {
    let annotations = this.annotations?.();
    if (!annotations) return;
    annotations = annotations.filter((_, index) => index !== idx);
    this.annotations?.set(annotations);
  }

  private makeAnnotation(type: AnnotationType, relativeX: number, relativeY: number): Annotation {
    return {
      id: Date.now(),
      type,
      relativeX: signal(relativeX),
      relativeY: signal(relativeY),
      relativeWidth: signal(0),
      relativeHeight: signal(0),
      naturalX: toNatural(relativeX, this.naturalWidth),
      naturalY: toNatural(relativeY, this.naturalHeight),
      naturalWidth: 0,
      naturalHeight: 0,
      value: signal(''),
    };
  }

  private handleMouseMove(callback: (moveEvent: MouseEvent) => void): void {
    const unsubscribeMouseMove = this.renderer.listen('document', 'mousemove', callback);
    const unsubscribeMouseUp = this.renderer.listen('document', 'mouseup', () => {
      unsubscribeMouseMove();
      unsubscribeMouseUp();
    });
  }
}
