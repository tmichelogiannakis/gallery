import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { NotFound } from './not-found';
import { expectNoAxeViolations } from '../../testing/axe';

describe('NotFound', () => {
  let fixture: ComponentFixture<NotFound>;

  const host = () => fixture.nativeElement as HTMLElement;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([])]
    });

    fixture = TestBed.createComponent(NotFound);
    await fixture.whenStable();
  });

  it('names the page in a heading', () => {
    expect(host().querySelector('h1')?.textContent?.trim()).toBe('Page not found');
  });

  it('offers a way back to the photo stream', () => {
    const action = host().querySelector('.not-found-action') as HTMLAnchorElement;

    expect(action.getAttribute('href')).toBe('/');
  });

  it('has no accessibility violations', async () => {
    await expectNoAxeViolations(fixture);
  });
});
