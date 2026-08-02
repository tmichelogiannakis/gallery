import { PRECONNECT_CHECK_BLOCKLIST } from '@angular/common';
import { Provider } from '@angular/core';

// The picsum preconnect lives in index.html, which tests do not load, so skip the check for it here
const providers: Provider[] = [
  { provide: PRECONNECT_CHECK_BLOCKLIST, useValue: 'https://picsum.photos' }
];

export default providers;
