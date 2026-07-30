import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { elementSizeState } from '@/store/elementSizeState';
import { useHeaderHeightRef } from '../useHeaderHeightRef';

type ObserverInstance = {
  callback: ResizeObserverCallback;
};

const observerInstances: ObserverInstance[] = [];

class ControlledResizeObserver {
  callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    observerInstances.push(this);
  }

  observe() {}

  unobserve() {}

  disconnect() {}
}

const HeaderHeightConsumer = () => {
  const headerRef = useHeaderHeightRef();
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));

  return (
    <>
      <header ref={headerRef} />
      <main data-testid="layout" style={{ paddingTop: `${headerHeight}px` }}>
        <output>{headerHeight}</output>
      </main>
    </>
  );
};

describe('useHeaderHeightRef と HEADER_HEIGHT', () => {
  let observedHeight = 80;

  beforeEach(() => {
    observerInstances.length = 0;
    observedHeight = 80;
    vi.stubGlobal('ResizeObserver', ControlledResizeObserver);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
      () => ({ height: observedHeight }) as DOMRect
    );
  });

  test('実測高の通知をレイアウト用の共有状態へ反映する', () => {
    const { container } = render(
      <RecoilRoot>
        <HeaderHeightConsumer />
      </RecoilRoot>
    );
    const header = container.querySelector('header');

    expect(screen.getByRole('status')).toHaveTextContent('80');
    expect(screen.getByTestId('layout')).toHaveStyle({ paddingTop: '80px' });

    act(() => {
      observerInstances[0].callback(
        [
          {
            target: header,
            borderBoxSize: [{ blockSize: 132 }],
          } as unknown as ResizeObserverEntry,
        ],
        observerInstances[0] as unknown as ResizeObserver
      );
    });

    expect(screen.getByRole('status')).toHaveTextContent('132');
    expect(screen.getByTestId('layout')).toHaveStyle({ paddingTop: '132px' });
  });
});
