import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Alert, AlertVariant } from './alert';

describe('Alert', () => {
  let fixture: ComponentFixture<Alert>;

  const host = () => fixture.nativeElement as HTMLElement;

  const message = () => host().querySelector('.alert-message')?.textContent?.trim();

  const createComponent = async (message: string, variant?: AlertVariant) => {
    TestBed.configureTestingModule({ imports: [Alert] });

    fixture = TestBed.createComponent(Alert);
    fixture.componentRef.setInput('message', message);

    if (variant) {
      fixture.componentRef.setInput('variant', variant);
    }

    await fixture.whenStable();
  };

  it('renders the message', async () => {
    await createComponent('Nothing here yet.');

    expect(message()).toBe('Nothing here yet.');
  });

  it('announces politely by default', async () => {
    await createComponent('Nothing here yet.');

    expect(host().getAttribute('role')).toBe('status');
    expect(host().classList).not.toContain('alert-error');
  });

  it('announces assertively when reporting an error', async () => {
    await createComponent('Something went wrong.', 'error');

    expect(host().getAttribute('role')).toBe('alert');
    expect(host().classList).toContain('alert-error');
  });

  it('projects an action alongside the message', async () => {
    @Component({
      imports: [Alert],
      template: `<app-alert message="Something went wrong.">
        <button type="button" (click)="retried = true">Try again</button>
      </app-alert>`
    })
    class TestHost {
      retried = false;
    }

    const hostFixture = TestBed.createComponent(TestHost);
    await hostFixture.whenStable();

    const action = hostFixture.nativeElement.querySelector('app-alert button') as HTMLButtonElement;

    expect(action.textContent?.trim()).toBe('Try again');

    action.click();

    expect(hostFixture.componentInstance.retried).toBe(true);
  });
});
