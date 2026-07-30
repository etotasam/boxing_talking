import '@testing-library/jest-dom/vitest';
import { act, render, screen } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';
import { describe, expect, test } from 'vitest';
import { deviceState } from '@/store/deviceState';
import { useInitializeDevice } from '../useInitializeDevice';

const DeviceProbe = () => {
  useInitializeDevice();
  const device = useRecoilValue(deviceState);

  return <output data-testid="device">{device}</output>;
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

    expect(screen.getByTestId('device')).toHaveTextContent(expectedDevice);
  });

  test('リサイズ時に768px境界をPCへ切り替える', () => {
    window.innerWidth = 767;
    renderDeviceProbe();
    expect(screen.getByTestId('device')).toHaveTextContent('SP');

    act(() => {
      window.innerWidth = 768;
      window.dispatchEvent(new Event('resize'));
    });

    expect(screen.getByTestId('device')).toHaveTextContent('PC');
  });
});
