import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useHeaderHeightRef } from '../useHeaderHeightRef';

const setHeaderHeight = vi.fn();

vi.mock('recoil', () => ({
  useSetRecoilState: () => setHeaderHeight,
}));

vi.mock('@/store/elementSizeState', () => ({
  elementSizeState: (name: string) => name,
}));

type ObserverInstance = {
  callback: ResizeObserverCallback;
  disconnect: ReturnType<typeof vi.fn>;
  observe: ReturnType<typeof vi.fn>;
};

const observerInstances: ObserverInstance[] = [];

class ControlledResizeObserver {
  callback: ResizeObserverCallback;
  disconnect = vi.fn();
  observe = vi.fn();

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    observerInstances.push(this);
  }

  unobserve = vi.fn();
}

const HeaderRefHarness = () => {
  const headerRef = useHeaderHeightRef();

  return <header ref={headerRef} />;
};

describe('useHeaderHeightRef', () => {
  let observedHeight = 80;

  beforeEach(() => {
    setHeaderHeight.mockReset();
    observerInstances.length = 0;
    observedHeight = 80;
    vi.stubGlobal('ResizeObserver', ControlledResizeObserver);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ height: observedHeight }) as DOMRect
    );
  });

  test('ResizeObserverでheaderの初期高を共有し、表示上の高さが変わったときだけ更新する', () => {
    const { container } = render(<HeaderRefHarness />);
    const header = container.querySelector('header');
    const observer = observerInstances[0];

    expect(setHeaderHeight).toHaveBeenCalledWith(80);
    expect(observer.observe).toHaveBeenCalledWith(header, { box: 'border-box' });

    act(() => {
      observer.callback(
        [
          {
            target: header,
            borderBoxSize: [{ blockSize: 132 }],
          } as unknown as ResizeObserverEntry,
        ],
        observer as unknown as ResizeObserver
      );
    });

    expect(setHeaderHeight).toHaveBeenLastCalledWith(132);
    expect(setHeaderHeight).toHaveBeenCalledTimes(2);

    act(() => {
      observer.callback(
        [
          {
            target: header,
            borderBoxSize: [{ blockSize: 132 }],
          } as unknown as ResizeObserverEntry,
        ],
        observer as unknown as ResizeObserver
      );
    });

    expect(setHeaderHeight).toHaveBeenCalledTimes(2);
  });

  test('ResizeObserverの通知に高さ情報がない場合はheaderを直接計測し、unmount時に監視を解除する', () => {
    const { container, unmount } = render(<HeaderRefHarness />);
    const header = container.querySelector('header');
    const observer = observerInstances[0];
    observedHeight = 126;

    act(() => {
      observer.callback(
        [{ target: header, borderBoxSize: undefined } as unknown as ResizeObserverEntry],
        observer as unknown as ResizeObserver
      );
    });

    expect(setHeaderHeight).toHaveBeenLastCalledWith(126);

    unmount();

    expect(observer.disconnect).toHaveBeenCalledTimes(1);
  });
});
