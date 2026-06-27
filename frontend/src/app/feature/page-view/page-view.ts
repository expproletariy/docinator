import { Component, ElementRef, inject, input, OnInit, WritableSignal } from '@angular/core';
import { PageModel } from '../../api/document-api.interfaces';
import { AnnotationService } from '../annotation.service';
import { AnnotationDrawDirective } from '../annotation-draw.directive';
import { AnnotationMoveDirective } from '../annotation-move.directive';
import { FormsModule } from '@angular/forms';
import { Annotation } from '../interfaces';
import { ScaleService } from '../scale.service';

@Component({
  selector: 'app-page-view',
  templateUrl: './page-view.html',
  styleUrl: './page-view.scss',
  hostDirectives: [AnnotationDrawDirective],
  imports: [FormsModule, AnnotationMoveDirective],
})
export class PageView implements OnInit {
  private annotationService = inject(AnnotationService);
  private scaleService = inject(ScaleService);
  private elementRef = inject(ElementRef);

  public page = input.required<PageModel>();

  protected annotations?: WritableSignal<Annotation[]>;

  naturalWidth = 0;
  naturalHeight = 0;

  ngOnInit(): void {
    this.annotations = this.annotationService.annotationsByPage.get(this.page().number);
  }

  protected onPageLoaded(img: HTMLImageElement): void {
    this.naturalWidth = img.naturalWidth;
    this.naturalHeight = img.naturalHeight;
    this.scaleService.setMaxNativeWidth(img.naturalWidth);
  }

  protected deleteNote(idx: number): void {
    this.annotations?.update((annotations) => annotations.filter((_, index) => index !== idx));
  }

  addAnnotation(annotation: Annotation): void {
    this.annotations?.update((list) => [...list, annotation]);
  }

  getHostBounds(): DOMRect {
    return this.elementRef.nativeElement.getBoundingClientRect();
  }
}
