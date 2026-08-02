import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { App } from './app';
import { expectNoAxeViolations } from '../testing/axe';

describe('App', () => {
  let component: App;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])]
    }).compileComponents();

    const fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should contain a router-outlet inside app-shell', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const outlet = fixture.debugElement.query(By.css('app-shell router-outlet'));
    expect(outlet).not.toBeNull();
  });

  it('should pass navItems to app-shell and render navigation links in the DOM', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    const navLinks = fixture.debugElement.queryAll(By.css('app-shell app-header nav a'));
    expect(navLinks.length).toBe(2);
    expect(navLinks.map((link) => (link.nativeElement as HTMLElement).textContent?.trim())).toEqual(
      ['Photos', 'Favorites']
    );

    const iconNames = navLinks.map(
      (link) => link.query(By.directive(MatIcon))?.componentInstance.fontIcon
    );
    expect(iconNames).toEqual(['image', 'favorite']);
  });

  it('has no axe violations', async () => {
    const fixture = TestBed.createComponent(App);

    await expectNoAxeViolations(fixture);
  });
});
