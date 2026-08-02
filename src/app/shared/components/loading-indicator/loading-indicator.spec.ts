import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingIndicator } from './loading-indicator';

describe('LoadingIndicator', () => {
  let fixture: ComponentFixture<LoadingIndicator>;

  const spinner = () => fixture.nativeElement.querySelector('mat-spinner') as HTMLElement | null;

  const createComponent = async (ariaLabel: string) => {
    TestBed.configureTestingModule({ imports: [LoadingIndicator] });

    fixture = TestBed.createComponent(LoadingIndicator);
    fixture.componentRef.setInput('ariaLabel', ariaLabel);
    await fixture.whenStable();
  };

  it('renders a spinner', async () => {
    await createComponent('Loading favorites');

    expect(spinner()).not.toBeNull();
  });

  it('labels the spinner for screen readers', async () => {
    await createComponent('Loading favorites');

    expect(spinner()?.getAttribute('aria-label')).toBe('Loading favorites');
  });
});
