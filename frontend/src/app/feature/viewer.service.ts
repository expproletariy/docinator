import { computed, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { SCALE_MAX, SCALE_MIN, SCALE_STEP } from './constants';
import { Observable, tap } from 'rxjs';
import { AnnotationModel, DocumentModel } from '../api/document-api.interfaces';
import { DocumentApiService } from '../api/document-api.service';
import { Annotation } from './interfaces';

@Injectable()
export class ViewerService {
  private documentApiService = inject(DocumentApiService);

  #document = signal<DocumentModel | null>(null);
  public document = this.#document.asReadonly();

  public annotationsByPage: Map<number, WritableSignal<Annotation[]>> = new Map();

  public loadDocument(docId: number): Observable<DocumentModel> {
    return this.documentApiService.getDocument(docId).pipe(
      tap((doc) => this.#document.set(doc)),
      tap((doc) => {
        this.annotationsByPage.clear();
        doc.pages.forEach((page) => this.annotationsByPage.set(page.number, signal([])));
      }),
    );
  }

  public saveAnnotations(): void {
    console.warn('ViewerService.saveAnnotations()');
    const doc = this.document();
    if (!doc) return;
    console.warn({
      ...doc,
      pages: [
        ...doc.pages.map((page) => {
          const annotations = this.annotationsByPage.get(page.number);
          return {
            ...page,
            annotations: this.exportAnnotations(annotations?.()),
          };
        }),
      ],
    });
  }

  private exportAnnotations(annotations?: Annotation[]): AnnotationModel[] {
    if (!annotations) return [];

    return annotations.map((annotation) => ({
      id: annotation.id,
      type: annotation.type,
      value: annotation.value(),
      x: annotation.naturalX,
      y: annotation.naturalY,
      width: annotation.naturalWidth,
      height: annotation.naturalHeight,
    }));
  }
}
