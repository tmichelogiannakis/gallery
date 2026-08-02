import { Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Photo } from '../../types';
import { photoAltText } from '../../photo-labels';
import { PhotoCardBody } from '../photo-card-body/photo-card-body';

@Component({
  selector: 'app-photo-favorite-card',
  imports: [PhotoCardBody, MatIconModule],
  templateUrl: './photo-favorite-card.html',
  styleUrl: './photo-favorite-card.scss'
})
export class PhotoFavoriteCard {
  photo = input.required<Photo>();
  priority = input(false);
  isFavorite = input(false);

  photoSelected = output<Photo>();

  ariaLabel = computed(() =>
    this.isFavorite()
      ? `${photoAltText(this.photo())} is in your favorites`
      : `Add photo by ${this.photo().author} to favorites`
  );

  handleCardClick(): void {
    if (this.isFavorite()) {
      return;
    }
    this.photoSelected.emit(this.photo());
  }
}
