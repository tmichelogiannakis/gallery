import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { Shell } from './shell';
import { Header } from './header/header';
import { NavItem } from '../../shared/types';

@Component({
  imports: [Shell],
  template: `<app-shell><p class="projected">projected content</p></app-shell>`
})
class HostComponent {}

describe('Shell', () => {
  let component: Shell;
  let fixture: ComponentFixture<Shell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shell, HostComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Shell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', async () => {
    expect(component).toBeTruthy();
  });

  it('should pass navItems input through to the header', () => {
    const mockNavItems: NavItem[] = [
      { label: 'Home', path: '/' },
      { label: 'Photos', path: '/photos' },
      { label: 'Favorites', path: '/favorites' }
    ];

    fixture.componentRef.setInput('navItems', mockNavItems);
    fixture.detectChanges();

    const header = fixture.debugElement.query(By.directive(Header));
    expect(header.componentInstance.navItems()).toBe(mockNavItems);
  });

  it('should project content into the main region', async () => {
    const hostFixture = TestBed.createComponent(HostComponent);
    await hostFixture.whenStable();

    const projected = hostFixture.nativeElement.querySelector('main.app-main .projected');
    expect(projected?.textContent).toBe('projected content');
  });
});
