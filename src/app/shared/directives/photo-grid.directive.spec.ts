import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PhotoGridDirective } from './photo-grid.directive';

@Component({
  imports: [PhotoGridDirective],
  template: `<div appPhotoGrid><span>item</span></div>`
})
class Host {}

describe('PhotoGridDirective', () => {
  it('lays its host out as a grid', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    const host = fixture.nativeElement.querySelector('div') as HTMLElement;

    expect(host.classList.contains('photo-grid')).toBe(true);
  });

  it('leaves the host content in place', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.photo-grid span')?.textContent).toBe('item');
  });
});
