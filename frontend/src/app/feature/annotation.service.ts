import { Injectable, signal, WritableSignal } from '@angular/core';
import { AnnotationModel, DocumentModel, PageModel } from '../api/document-api.interfaces';
import { Annotation } from './interfaces';

@Injectable()
export class AnnotationService {
  annotationsByPage: Map<number, WritableSignal<Annotation[]>> = new Map();

  initPages(pages: PageModel[]): void {
    this.annotationsByPage.clear();
    pages.forEach((page) => this.annotationsByPage.set(page.number, signal([])));
  }

  saveAnnotations(document: DocumentModel | null): void {
    console.warn('AnnotationService.saveAnnotations()');
    if (!document) return;
    console.warn({
      ...document,
      pages: document.pages.map((page) => {
        const annotations = this.annotationsByPage.get(page.number);
        return {
          ...page,
          annotations: this.exportAnnotations(annotations?.()),
        };
      }),
    });
  }

  private exportAnnotations(annotations?: Annotation[]): AnnotationModel[] {
    if (!annotations) return [];
    return annotations.map((a) => ({
      id: a.id,
      type: a.type,
      value: a.value(),
      x: a.naturalX,
      y: a.naturalY,
      width: a.naturalWidth,
      height: a.naturalHeight,
    }));
  }
}
