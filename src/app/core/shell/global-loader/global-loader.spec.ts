import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalLoader } from './global-loader';
import { LoadingStore } from '../../services/loading.store';

describe('GlobalLoader', () => {
  let fixture: ComponentFixture<GlobalLoader>;
  let loadingStore: LoadingStore;

  const progressBar = () =>
    fixture.nativeElement.querySelector('mat-progress-bar') as HTMLElement | null;

  beforeEach(async () => {
    TestBed.configureTestingModule({ imports: [GlobalLoader] });

    fixture = TestBed.createComponent(GlobalLoader);
    loadingStore = TestBed.inject(LoadingStore);
    await fixture.whenStable();
  });

  it('renders nothing while nothing is loading', () => {
    expect(progressBar()).toBeNull();
  });

  it('renders a progress bar while something is loading', async () => {
    loadingStore.start();
    await fixture.whenStable();

    expect(progressBar()).not.toBeNull();
  });

  it('labels the progress bar for screen readers', async () => {
    loadingStore.start();
    await fixture.whenStable();

    expect(progressBar()?.getAttribute('aria-label')).toBe('Loading');
  });

  it('removes the progress bar once loading has finished', async () => {
    loadingStore.start();
    await fixture.whenStable();

    loadingStore.stop();
    await fixture.whenStable();

    expect(progressBar()).toBeNull();
  });
});
