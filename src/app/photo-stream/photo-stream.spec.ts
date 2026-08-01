import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotoStream } from './photo-stream';

describe('PhotoStream', () => {
  let component: PhotoStream;
  let fixture: ComponentFixture<PhotoStream>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotoStream]
    }).compileComponents();

    fixture = TestBed.createComponent(PhotoStream);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
