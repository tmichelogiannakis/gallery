import { Component, input } from '@angular/core';

export type AlertVariant = 'error' | 'info';

@Component({
  selector: 'app-alert',
  imports: [],
  templateUrl: './alert.html',
  styleUrl: './alert.scss',
  host: {
    class: 'alert',
    '[class.alert-error]': "variant() === 'error'",
    '[attr.role]': "variant() === 'error' ? 'alert' : 'status'"
  }
})
export class Alert {
  message = input.required<string>();
  variant = input<AlertVariant>('info');
}
