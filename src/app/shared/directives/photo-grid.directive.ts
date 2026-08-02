import { Directive } from '@angular/core';

export const PHOTO_GRID_ITEM_WIDTH_PX = 200;

export const PHOTO_GRID_PRIORITY_COUNT = 10;

@Directive({
  selector: '[appPhotoGrid]',
  host: {
    class: 'photo-grid',
    '[style.--photo-grid-item-width]': 'itemWidth'
  }
})
export class PhotoGridDirective {
  protected readonly itemWidth = `${PHOTO_GRID_ITEM_WIDTH_PX}px`;
}
