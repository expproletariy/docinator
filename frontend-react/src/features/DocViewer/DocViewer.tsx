import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import type { DocumentModel, Annotation } from '../../api/types';
import { getDocument } from '../../api/documentApi';
import { SCALE_STEP, SCALE_MIN, SCALE_MAX } from '../../constants';
import { PageView } from '../PageView/PageView';
import styles from './DocViewer.module.scss';

export function DocViewer() {
  const { documentId } = useParams();
  const [document, setDocument] = useState<DocumentModel | null>(null);
  const [scale, setScale] = useState(1);
  const [maxNativeWidth, setMaxNativeWidth] = useState<number | null>(null);
  const [annotationsByPage, setAnnotationsByPage] = useState<Map<number, Annotation[]>>(new Map());

  useEffect(() => {
    if (!documentId) return;
    let cancelled = false;

    getDocument(Number(documentId)).then((doc) => {
      if (cancelled) return;
      setDocument(doc);
      const map = new Map<number, Annotation[]>();
      doc.pages.forEach((page) => map.set(page.number, []));
      setAnnotationsByPage(map);
    });

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  const scaledWidth = useMemo(() => {
    const nw = maxNativeWidth;
    return nw !== null ? nw * scale : null;
  }, [maxNativeWidth, scale]);

  const handleMaxNativeWidth = useCallback((width: number) => {
    setMaxNativeWidth((prev) => (prev === null || width > prev ? width : prev));
  }, []);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(s + SCALE_STEP, SCALE_MAX));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(s - SCALE_STEP, SCALE_MIN));
  }, []);

  const saveAnnotations = useCallback(() => {
    console.warn('saveAnnotations()', {
      document,
      annotations: [...annotationsByPage.entries()].map(([page, anns]) => ({
        page,
        annotations: anns.map((a) => ({
          id: a.id,
          type: a.type,
          value: a.value,
          x: a.naturalX,
          y: a.naturalY,
          width: a.naturalWidth,
          height: a.naturalHeight,
        })),
      })),
    });
  }, [document, annotationsByPage]);

  const handleAddAnnotation = useCallback(
    (pageNumber: number, annotation: Annotation) => {
      setAnnotationsByPage((prev) => {
        const next = new Map(prev);
        const list = next.get(pageNumber);
        if (list) {
          next.set(pageNumber, [...list, annotation]);
        }
        return next;
      });
    },
    [],
  );

  const handleUpdateAnnotation = useCallback(
    (pageNumber: number, id: number, changes: Partial<Annotation>) => {
      setAnnotationsByPage((prev) => {
        const next = new Map(prev);
        const list = next.get(pageNumber);
        if (!list) return prev;
        next.set(
          pageNumber,
          list.map((a) => (a.id === id ? { ...a, ...changes } : a)),
        );
        return next;
      });
    },
    [],
  );

  const handleDeleteAnnotation = useCallback(
    (pageNumber: number, id: number) => {
      setAnnotationsByPage((prev) => {
        const next = new Map(prev);
        const list = next.get(pageNumber);
        if (!list) return prev;
        next.set(
          pageNumber,
          list.filter((a) => a.id !== id),
        );
        return next;
      });
    },
    [],
  );

  if (!document) {
    return <div className={styles.loading}>loading...</div>;
  }

  return (
    <div className={styles.host}>
      <div className={styles.header}>
        <div className={styles.headerTitle}>{document.name}</div>
        <div className={styles.headerTools}>
          {Math.round(scale * 100)}%
          <button onClick={zoomIn}>+</button>
          <button onClick={zoomOut}>-</button>
          <button onClick={saveAnnotations}>Save</button>
        </div>
      </div>
      <div className={styles.documentWrapper}>
        <div
          className={styles.documentContent}
          style={scaledWidth !== null ? ({ '--scale': `${scaledWidth}px` } as React.CSSProperties) : undefined}
        >
          {document.pages.map((page) => (
            <PageView
              key={page.number}
              page={page}
              annotations={annotationsByPage.get(page.number) ?? []}
              onMaxNativeWidth={handleMaxNativeWidth}
              onAddAnnotation={handleAddAnnotation}
              onUpdateAnnotation={handleUpdateAnnotation}
              onDeleteAnnotation={handleDeleteAnnotation}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
