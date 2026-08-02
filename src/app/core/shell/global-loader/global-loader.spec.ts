import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalLoader } from './global-loader';
import { LoadingStore } from '../../services/loading.store';
import { expectNoAxeViolations } from '../../../../testing/axe';

describe('GlobalLoader', () => {
  let fixture: ComponentFixture<GlobalLoader>;
  let loadingStore: LoadingStore;

  const progressBar = () =>
    fixture.nativeElement.querySelector('mat-progress-bar') as HTMLElement | null;

  const liveRegion = () =>
    fixture.nativeElement.querySelector('[role="status"]') as HTMLElement | null;

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

  it('announces the wait, leaving the bar itself to sighted users', async () => {
    loadingStore.start();
    await fixture.whenStable();

    expect(liveRegion()?.textContent).toBe('Loading');
    expect(progressBar()?.getAttribute('aria-hidden')).toBe('true');
  });

  // The region has to outlive the bar, or the message it carries is not reliably announced
  it('keeps the live region in place while nothing is loading', () => {
    expect(liveRegion()).not.toBeNull();
    expect(liveRegion()?.textContent).toBe('');
  });

  it('removes the progress bar once loading has finished', async () => {
    loadingStore.start();
    await fixture.whenStable();

    loadingStore.stop();
    await fixture.whenStable();

    expect(progressBar()).toBeNull();
    expect(liveRegion()?.textContent).toBe('');
  });

  it('has no axe violations while loading', async () => {
    loadingStore.start();
    await fixture.whenStable();

    await expectNoAxeViolations(fixture);
  });
});
