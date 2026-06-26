import { Component, computed, DestroyRef, inject, input } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { DecimalPipe } from '@angular/common';
import { PageView } from '../page-view/page-view';
import { ViewerService } from '../viewer.service';
import { ScaleService } from '../scale.service';

@Component({
  selector: 'app-doc-viewer',
  imports: [PageView, DecimalPipe],
  templateUrl: './doc-viewer.html',
  styleUrl: './doc-viewer.scss',
  providers: [ViewerService, ScaleService],
})
export class DocViewer {
  private viewerService = inject(ViewerService);
  private scaleService = inject(ScaleService);
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
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  protected zoomIn = () => this.scaleService.zoomIn();
  protected zoomOut = () => this.scaleService.zoomOut();
  protected saveAnnotations = () => this.viewerService.saveAnnotations();
}
