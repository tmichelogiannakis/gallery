import { Component, inject } from '@angular/core';
import { PhotosService } from './services/photos.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { PhotoGrid } from './components/photo-grid/photo-grid';
import { PhotoGridItem } from './components/photo-grid-item/photo-grid-item';

@Component({
  selector: 'app-photo-stream',
  imports: [PhotoGrid, PhotoGridItem],
  templateUrl: './photo-stream.html',
  styleUrl: './photo-stream.scss'
})
export class PhotoStream {
  photosService = inject(PhotosService);

  photos = toSignal(this.photosService.list(1), { initialValue: [] });
}
