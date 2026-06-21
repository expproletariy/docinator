import { useRef, useCallback } from 'react';
import type { PageModel, Annotation } from '../../api/types';
import styles from './PageView.module.scss';

interface PageViewProps {
  page: PageModel;
  annotations: Annotation[];
  onMaxNativeWidth: (width: number) => void;
  onAddAnnotation: (pageNumber: number, annotation: Annotation) => void;
  onUpdateAnnotation: (pageNumber: number, id: number, changes: Partial<Annotation>) => void;
  onDeleteAnnotation: (pageNumber: number, id: number) => void;
}

export function PageView({
  page,
  annotations,
  onMaxNativeWidth,
  onAddAnnotation,
  onUpdateAnnotation,
  onDeleteAnnotation,
}: PageViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const naturalWidthRef = useRef(0);
  const naturalHeightRef = useRef(0);

  const handleImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      naturalWidthRef.current = img.naturalWidth;
      naturalHeightRef.current = img.naturalHeight;
      onMaxNativeWidth(img.naturalWidth);
    },
    [onMaxNativeWidth],
  );

  const handleContainerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.target !== containerRef.current) return;
      e.preventDefault();

      const bounds = containerRef.current!.getBoundingClientRect();
      const relativeX = ((e.clientX - bounds.left) * 100) / bounds.width;
      const relativeY = ((e.clientY - bounds.top) * 100) / bounds.height;
      const nw = naturalWidthRef.current;
      const nh = naturalHeightRef.current;

      const annotation: Annotation = {
        id: Date.now(),
        type: 'text',
        relativeX,
        relativeY,
        relativeWidth: 0,
        relativeHeight: 0,
        naturalX: (nw * relativeX) / 100,
        naturalY: (nh * relativeY) / 100,
        naturalWidth: 0,
        naturalHeight: 0,
        value: '',
      };

      onAddAnnotation(page.number, annotation);

      const onMouseMove = (moveEvent: MouseEvent) => {
        const rw = ((moveEvent.clientX - bounds.left) * 100) / bounds.width - relativeX;
        const rh = ((moveEvent.clientY - bounds.top) * 100) / bounds.height - relativeY;
        onUpdateAnnotation(page.number, annotation.id, {
          relativeWidth: rw,
          relativeHeight: rh,
          naturalWidth: (nw * rw) / 100,
          naturalHeight: (nh * rh) / 100,
        });
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [page.number, onAddAnnotation, onUpdateAnnotation],
  );

  return (
    <div ref={containerRef} className={styles.pageView} onMouseDown={handleContainerMouseDown}>
      <img
        className={styles.pageContent}
        src={page.imageUrl}
        alt={`Page ${page.number}`}
        onLoad={handleImageLoad}
      />
      {annotations.map((annotation) => (
        <AnnotationOverlay
          key={annotation.id}
          annotation={annotation}
          pageNumber={page.number}
          containerRef={containerRef}
          naturalWidthRef={naturalWidthRef}
          naturalHeightRef={naturalHeightRef}
          onUpdate={onUpdateAnnotation}
          onDelete={onDeleteAnnotation}
        />
      ))}
    </div>
  );
}

interface AnnotationOverlayProps {
  annotation: Annotation;
  pageNumber: number;
  containerRef: React.RefObject<HTMLDivElement | null>;
  naturalWidthRef: React.MutableRefObject<number>;
  naturalHeightRef: React.MutableRefObject<number>;
  onUpdate: (pageNumber: number, id: number, changes: Partial<Annotation>) => void;
  onDelete: (pageNumber: number, id: number) => void;
}

function AnnotationOverlay({
  annotation,
  pageNumber,
  containerRef,
  naturalWidthRef,
  naturalHeightRef,
  onUpdate,
  onDelete,
}: AnnotationOverlayProps) {
  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(pageNumber, annotation.id);
    },
    [pageNumber, annotation.id, onDelete],
  );

  const handleContentMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const targetRect = (e.target as HTMLElement).getBoundingClientRect();
      const offsetX = e.clientX - targetRect.left;
      const offsetY = e.clientY - targetRect.top;
      const bounds = containerRef.current!.getBoundingClientRect();
      const nw = naturalWidthRef.current;
      const nh = naturalHeightRef.current;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const rx = ((moveEvent.clientX - bounds.left - offsetX) * 100) / bounds.width;
        const ry = ((moveEvent.clientY - bounds.top - offsetY) * 100) / bounds.height;
        onUpdate(pageNumber, annotation.id, {
          relativeX: rx,
          relativeY: ry,
          naturalX: (nw * rx) / 100,
          naturalY: (nh * ry) / 100,
        });
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [annotation.id, annotation.relativeX, annotation.relativeY, containerRef, naturalWidthRef, naturalHeightRef, pageNumber, onUpdate],
  );

  const handleValueChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onUpdate(pageNumber, annotation.id, { value: e.target.value });
    },
    [pageNumber, annotation.id, onUpdate],
  );

  return (
    <div
      className={styles.annotation}
      style={{
        left: `${annotation.relativeX}%`,
        top: `${annotation.relativeY}%`,
        width: `${Math.abs(annotation.relativeWidth)}%`,
        height: `${Math.abs(annotation.relativeHeight)}%`,
      }}
    >
      <button className={styles.annotationDeleteBtn} onClick={handleDelete}>
        +
      </button>
      <div className={styles.annotationContent} onMouseDown={handleContentMouseDown}>
        {annotation.type === 'text' && (
          <textarea
            className={styles.annotationContentText}
            value={annotation.value}
            onChange={handleValueChange}
          />
        )}
        {annotation.type === 'image' && null}
      </div>
    </div>
  );
}
