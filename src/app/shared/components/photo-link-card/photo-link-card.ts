import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Photo } from '../../types';
import { PhotoCardBody } from '../photo-card-body/photo-card-body';

@Component({
  selector: 'app-photo-link-card',
  imports: [PhotoCardBody, RouterLink],
  templateUrl: './photo-link-card.html',
  styleUrl: './photo-link-card.scss'
})
export class PhotoLinkCard {
  photo = input.required<Photo>();
  priority = input(false);
  link = input.required<unknown[]>();
}
