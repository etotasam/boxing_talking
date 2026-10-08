import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { describe, expect, test } from 'vitest';
import { isPcState } from '@/store/isPcState';
import { useInitializeDevice } from '../useInitializeDevice';

const DeviceProbe = () => {
  useInitializeDevice();
  const isPc = useRecoilValue(isPcState);

  return <output data-testid="isPc">{isPc ? 'PC' : 'SP'}</output>;
};

const renderDeviceProbe = () =>
  render(
    <RecoilRoot>
      <DeviceProbe />
    </RecoilRoot>
  );

describe('useInitializeDevice', () => {
  test.each([
    [767, 'SP'],
    [768, 'PC'],
    [769, 'PC'],
  ])('viewport幅%dpxでは%sを設定する', (width, expectedDevice) => {
    window.innerWidth = width;

    renderDeviceProbe();

    expect(screen.getByTestId('isPc')).toHaveTextContent(expectedDevice);
  });

  test.each([
    [767, 768, 'SP', 'PC'],
    [768, 767, 'PC', 'SP'],
  ])(
    'リサイズ時に%dpxから%dpxへ表示を切り替える',
    (initialWidth, nextWidth, before, after) => {
      window.innerWidth = initialWidth;
      renderDeviceProbe();
      expect(screen.getByTestId('isPc')).toHaveTextContent(before);

      act(() => {
        window.innerWidth = nextWidth;
        window.dispatchEvent(new Event('resize'));
      });

      expect(screen.getByTestId('isPc')).toHaveTextContent(after);
    }
  );
});
