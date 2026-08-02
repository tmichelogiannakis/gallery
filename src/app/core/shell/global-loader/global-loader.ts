import { Component, inject } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { LoadingStore } from '../../services/loading.store';

@Component({
  selector: 'app-global-loader',
  imports: [MatProgressBarModule],
  templateUrl: './global-loader.html',
  styleUrl: './global-loader.scss'
})
export class GlobalLoader {
  readonly loadingStore = inject(LoadingStore);
}
