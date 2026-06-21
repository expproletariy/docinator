import type { DocumentModel } from './types';

export async function getDocument(id: number): Promise<DocumentModel> {
  const res = await fetch(`/mocks/api/${id}.json`);
  const doc: DocumentModel = await res.json();

  return {
    ...doc,
    pages: doc.pages.map((page) => ({
      ...page,
      imageUrl: `/mocks/documents/${id}/${page.imageUrl}`,
    })),
  };
}
