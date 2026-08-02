import { TestBed } from '@angular/core/testing';
import { LoadingStore } from './loading.store';

describe('LoadingStore', () => {
  let store: LoadingStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(LoadingStore);
  });

  it('is not loading to begin with', () => {
    expect(store.isLoading()).toBe(false);
  });

  it('is loading once a request has started', () => {
    store.start();

    expect(store.isLoading()).toBe(true);
  });

  it('is not loading once the started request has stopped', () => {
    store.start();
    store.stop();

    expect(store.isLoading()).toBe(false);
  });

  it('stays loading until every started request has stopped', () => {
    store.start();
    store.start();
    store.stop();

    expect(store.isLoading()).toBe(true);

    store.stop();

    expect(store.isLoading()).toBe(false);
  });

  it('ignores a stop that was never started', () => {
    store.stop();
    store.start();

    expect(store.isLoading()).toBe(true);
  });
});
