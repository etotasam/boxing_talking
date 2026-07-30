import '@testing-library/jest-dom/vitest';
import { render, screen } from 'test-setup';
import { describe, expect, test } from 'vitest';
import { COUNTRY } from '@/constants/country';
import { FlagImage } from '@/components/atomic/FlagImage';

describe('FlagImage', () => {
  test.each([
    [COUNTRY.JAPAN],
    [COUNTRY.USA],
    [COUNTRY.UK],
  ])('%s の国旗をアクセシブルな画像として表示する', (nationality) => {
    render(<FlagImage nationality={nationality} />);

    expect(screen.getByRole('img', { name: nationality })).toBeInTheDocument();
  });

  test('渡された className を wrapper に反映する', () => {
    render(
      <FlagImage className="h-[18px] w-[24px] shrink-0 border-[1px]" nationality={COUNTRY.JAPAN} />
    );

    expect(screen.getByRole('img', { name: COUNTRY.JAPAN }).parentElement).toHaveClass(
      'h-[18px]',
      'w-[24px]',
      'shrink-0',
      'border-[1px]'
    );
  });

  test('SVG を cover 相当で表示する', () => {
    render(<FlagImage nationality={COUNTRY.JAPAN} />);

    expect(screen.getByRole('img', { name: COUNTRY.JAPAN })).toHaveAttribute(
      'preserveAspectRatio',
      'xMidYMid slice'
    );
  });
});
