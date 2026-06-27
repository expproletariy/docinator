import { Component, computed, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, tap } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { PageView } from '../page-view/page-view';
import { ViewerService } from '../viewer.service';
import { ScaleService } from '../scale.service';
import { AnnotationService } from '../annotation.service';

@Component({
  selector: 'app-doc-viewer',
  imports: [PageView, DecimalPipe],
  templateUrl: './doc-viewer.html',
  styleUrl: './doc-viewer.scss',
  providers: [ViewerService, ScaleService, AnnotationService],
})
export class DocViewer {
  private viewerService = inject(ViewerService);
  private scaleService = inject(ScaleService);
  private annotationService = inject(AnnotationService);
  private destroyRef = inject(DestroyRef);

  documentId = input.required<number>();

  document = this.viewerService.document;
  scale = this.scaleService.scale;
  scaledWidth = this.scaleService.scaledWidth;

  scaledWidthPx = computed(() => {
    const scaledSize = this.scaledWidth();
    return scaledSize !== null ? `${scaledSize}px` : null;
  });

  constructor() {
    this.initDataLoader();
  }

  private initDataLoader(): void {
    toObservable(this.documentId)
      .pipe(
        switchMap((docId) => this.viewerService.loadDocument(docId)),
        tap((doc) => this.annotationService.initPages(doc.pages)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  protected zoomIn = () => this.scaleService.zoomIn();
  protected zoomOut = () => this.scaleService.zoomOut();
  protected saveAnnotations = () => this.annotationService.saveAnnotations(this.document());
}
