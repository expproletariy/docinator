export interface DocumentModel {
  name: string;
  pages: PageModel[];
}

export interface PageModel {
  number: number;
  imageUrl: string;
}

export interface AnnotationModel {
  id: number;
  height: number;
  width: number;
  x: number;
  y: number;
  type: string;
  value: unknown;
}

export type AnnotationType = 'highlight' | 'text' | 'image';

export interface Annotation {
  id: number;
  type: AnnotationType;
  relativeX: number;
  relativeY: number;
  relativeWidth: number;
  relativeHeight: number;
  naturalX: number;
  naturalY: number;
  naturalWidth: number;
  naturalHeight: number;
  value: string;
}
