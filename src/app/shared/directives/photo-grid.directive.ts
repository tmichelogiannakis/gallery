import { Directive } from '@angular/core';

@Directive({
  selector: '[appPhotoGrid]',
  host: {
    class: 'photo-grid'
  }
})
export class PhotoGridDirective {}
