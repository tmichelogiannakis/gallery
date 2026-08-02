import { Component, input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-indicator',
  imports: [MatProgressSpinnerModule],
  templateUrl: './loading-indicator.html',
  styleUrl: './loading-indicator.scss'
})
export class LoadingIndicator {
  ariaLabel = input.required<string>();
}
