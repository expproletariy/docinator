import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { DocumentModel } from '../api/document-api.interfaces';
import { DocumentApiService } from '../api/document-api.service';

@Injectable()
export class ViewerService {
  private documentApiService = inject(DocumentApiService);

  #document = signal<DocumentModel | null>(null);
  public document = this.#document.asReadonly();

  public loadDocument(docId: number): Observable<DocumentModel> {
    return this.documentApiService.getDocument(docId).pipe(
      tap((doc) => this.#document.set(doc)),
    );
  }
}
