import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OnVisibleDirective } from './on-visible.directive';

// IntersectionObserver isn't available in jsdom
class IntersectionObserverStub {
  static latest: IntersectionObserverStub | undefined;

  readonly observe = vi.fn<(target: Element) => void>();
  readonly unobserve = vi.fn<(target: Element) => void>();
  readonly disconnect = vi.fn<() => void>();
  readonly takeRecords = vi.fn<() => IntersectionObserverEntry[]>(() => []);

  readonly rootMargin: string;

  constructor(
    readonly callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    this.rootMargin = options?.rootMargin ?? '';
    IntersectionObserverStub.latest = this;
  }
}

@Component({
  imports: [OnVisibleDirective],
  template: `<div [rootMargin]="margin()" appOnVisible (visible)="onSeen()"></div>`
})
class Host {
  readonly margin = signal('400px 0px');
  seen = 0;

  onSeen(): void {
    this.seen = this.seen + 1;
  }
}

@Component({
  imports: [OnVisibleDirective],
  template: `<div appOnVisible></div>`
})
class DefaultHost {}

describe('OnVisibleDirective', () => {
  let fixture: ComponentFixture<Host>;

  const forgetObserver = () => (IntersectionObserverStub.latest = undefined);

  const latestObserver = () => {
    const observer = IntersectionObserverStub.latest;
    if (!observer) {
      throw new Error('Expected the directive to have built an IntersectionObserver.');
    }
    return observer;
  };

  const reportIntersection = (isIntersecting: boolean) => {
    const observer = latestObserver();
    observer.callback([{ isIntersecting } as IntersectionObserverEntry], observer as never);
  };

  beforeEach(async () => {
    forgetObserver();
    vi.stubGlobal('IntersectionObserver', IntersectionObserverStub);

    TestBed.configureTestingModule({ imports: [Host] });

    fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('observes its host element', () => {
    expect(latestObserver().observe).toHaveBeenCalledExactlyOnceWith(
      fixture.nativeElement.querySelector('div')
    );
  });

  it('emits when the host comes into view', () => {
    reportIntersection(true);

    expect(fixture.componentInstance.seen).toBe(1);
  });

  it('does not emit while the host is out of view', () => {
    reportIntersection(false);

    expect(fixture.componentInstance.seen).toBe(0);
  });

  it('grows the viewport by the given root margin so it emits before the host is on screen', () => {
    expect(latestObserver().rootMargin).toBe('400px 0px');
  });

  it('looks a quarter of a screen ahead by default, so the lookahead scales with the viewport', async () => {
    forgetObserver();

    const defaulted = TestBed.createComponent(DefaultHost);
    await defaulted.whenStable();

    expect(latestObserver().rootMargin).toBe('25% 0px');
  });

  it('rebuilds the observer when the root margin changes', async () => {
    const original = latestObserver();

    fixture.componentInstance.margin.set('100px 0px');
    await fixture.whenStable();

    expect(original.disconnect).toHaveBeenCalledOnce();
    expect(latestObserver()).not.toBe(original);
    expect(latestObserver().rootMargin).toBe('100px 0px');
  });

  it('disconnects when destroyed, so removing the host from the template tears the observer down', () => {
    const observer = latestObserver();

    fixture.destroy();

    expect(observer.disconnect).toHaveBeenCalledOnce();
  });

  it('does nothing where IntersectionObserver is unavailable', async () => {
    vi.unstubAllGlobals();
    forgetObserver();

    const bare = TestBed.createComponent(Host);
    await bare.whenStable();

    expect(IntersectionObserverStub.latest).toBeUndefined();
    expect(bare.componentInstance.seen).toBe(0);
  });
});
