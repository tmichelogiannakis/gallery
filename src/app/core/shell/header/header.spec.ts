import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';
import { MatIcon } from '@angular/material/icon';
import { Header, ACTIVE_CLASS } from './header';
import { NavItem } from '../../../shared/types';
import { expectNoAxeViolations } from '../../../../testing/axe';

@Component({ template: '' })
class DummyComponent {}

describe('Header', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let router: Router;

  const mockNavItems: NavItem[] = [
    { label: 'Home', path: '/' },
    { label: 'Photos', path: '/photos' },
    { label: 'Favorites', path: '/favorites' }
  ];

  const getNavLinks = () =>
    Array.from(fixture.nativeElement.querySelectorAll('.nav-links a')) as HTMLAnchorElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        provideRouter([
          { path: '', component: DummyComponent },
          { path: 'photos', component: DummyComponent },
          { path: 'photos/detail', component: DummyComponent },
          { path: 'favorites', component: DummyComponent }
        ])
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render no navigation links with an empty input array', () => {
    fixture.componentRef.setInput('navItems', []);
    fixture.detectChanges();

    expect(getNavLinks().length).toBe(0);
  });

  it('should render navigation links matching the provided input array', () => {
    fixture.componentRef.setInput('navItems', mockNavItems);
    fixture.detectChanges();

    const navLinks = getNavLinks();
    expect(navLinks.length).toBe(3);
    expect(navLinks[0]?.textContent?.trim()).toBe('Home');
    expect(navLinks[1]?.textContent?.trim()).toBe('Photos');
    expect(navLinks[2]?.textContent?.trim()).toBe('Favorites');
  });

  it('should link the brand to the root route', () => {
    const brand = fixture.nativeElement.querySelector('a.brand') as HTMLAnchorElement;

    expect(brand.getAttribute('href')).toBe('/');
    expect(brand.getAttribute('aria-label')).toBe('Photo Gallery');
  });

  it('should render an icon only for nav items that define one', () => {
    const items: NavItem[] = [
      { label: 'Photos', iconName: 'image', path: '/photos' },
      { label: 'Favorites', path: '/favorites' }
    ];

    fixture.componentRef.setInput('navItems', items);
    fixture.detectChanges();

    const [withIcon, withoutIcon] = fixture.debugElement.queryAll(By.css('.nav-links a'));
    expect(withIcon?.query(By.directive(MatIcon))?.componentInstance.fontIcon).toBe('image');
    expect(withoutIcon?.query(By.directive(MatIcon))).toBeNull();
  });

  it('has no axe violations', async () => {
    fixture.componentRef.setInput('navItems', [
      { label: 'Photos', iconName: 'image', path: '/photos' },
      { label: 'Favorites', iconName: 'favorite', path: '/favorites' }
    ] satisfies NavItem[]);
    await fixture.whenStable();

    await expectNoAxeViolations(fixture);
  });

  describe('routerLinkActive', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('navItems', mockNavItems);
      fixture.detectChanges();
    });

    it('should set active state on the link matching the current route', async () => {
      await router.navigateByUrl('/photos');
      fixture.detectChanges();

      const [homeLink, photosLink] = getNavLinks();
      expect(photosLink?.classList.contains(ACTIVE_CLASS)).toBe(true);
      expect(homeLink?.classList.contains(ACTIVE_CLASS)).toBe(false);
    });

    it('should enforce exact matching for root path "/"', async () => {
      await router.navigateByUrl('/photos');
      fixture.detectChanges();

      expect(getNavLinks()[0]?.classList.contains(ACTIVE_CLASS)).toBe(false);

      await router.navigateByUrl('/');
      fixture.detectChanges();

      expect(getNavLinks()[0]?.classList.contains(ACTIVE_CLASS)).toBe(true);
    });

    it('should support non-exact matching for sub-routes on non-root paths', async () => {
      await router.navigateByUrl('/photos/detail');
      fixture.detectChanges();

      expect(getNavLinks()[1]?.classList.contains(ACTIVE_CLASS)).toBe(true);
    });
  });
});
