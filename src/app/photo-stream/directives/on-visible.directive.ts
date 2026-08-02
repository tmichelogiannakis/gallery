import { Directive, ElementRef, effect, inject, input, output } from '@angular/core';

const DEFAULT_ROOT_MARGIN = '25% 0px';

@Directive({
  selector: '[appOnVisible]'
})
export class OnVisibleDirective {
  readonly rootMargin = input(DEFAULT_ROOT_MARGIN);

  readonly visible = output<void>();

  private readonly elementRef = inject<ElementRef<Element>>(ElementRef);

  constructor() {
    effect((onCleanup) => {
      const rootMargin = this.rootMargin();

      if (typeof IntersectionObserver === 'undefined') {
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            this.visible.emit();
          }
        },
        { rootMargin }
      );
      observer.observe(this.elementRef.nativeElement);

      onCleanup(() => observer.disconnect());
    });
  }
}
