import '@testing-library/jest-dom/vitest';
import { render, screen } from 'test-setup';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { PredictionVoteModal } from '../PredictionVoteModal';

const boxersData = {
  red: {
    name: 'ルイス・アルベルト・ロペス',
    country: 'Mexico' as const,
  },
  blue: {
    name: 'サウル"カネロ"・アルバレス',
    country: 'Mexico' as const,
  },
};

describe('PredictionVoteModal', () => {
  test('選手を選択してから投票を確定できる', async () => {
    const user = userEvent.setup();
    const voteExecution = vi.fn();

    render(
      <PredictionVoteModal boxersData={boxersData} voteExecution={voteExecution} close={vi.fn()} />
    );

    const submitButton = screen.getByRole('button', { name: 'この選手に投票する' });
    const redBoxerButton = screen.getByRole('button', {
      name: /ルイス・アルベルト・ロペス/,
    });

    expect(submitButton).toBeDisabled();

    await user.click(redBoxerButton);

    expect(redBoxerButton).toHaveAttribute('aria-pressed', 'true');
    expect(submitButton).toBeEnabled();
    expect(voteExecution).not.toHaveBeenCalled();

    await user.click(submitButton);

    expect(voteExecution).toHaveBeenCalledOnce();
    expect(voteExecution).toHaveBeenCalledWith('red');
  });

  test('選手を切り替えると最後に選択した選手へ投票する', async () => {
    const user = userEvent.setup();
    const voteExecution = vi.fn();

    render(
      <PredictionVoteModal boxersData={boxersData} voteExecution={voteExecution} close={vi.fn()} />
    );

    const redBoxerButton = screen.getByRole('button', {
      name: /ルイス・アルベルト・ロペス/,
    });
    const blueBoxerButton = screen.getByRole('button', {
      name: /サウル"カネロ"・アルバレス/,
    });

    await user.click(redBoxerButton);
    await user.click(blueBoxerButton);
    await user.click(screen.getByRole('button', { name: 'この選手に投票する' }));

    expect(redBoxerButton).toHaveAttribute('aria-pressed', 'false');
    expect(blueBoxerButton).toHaveAttribute('aria-pressed', 'true');
    expect(voteExecution).toHaveBeenCalledWith('blue');
  });

  test('右上の閉じるボタンからモーダルを閉じる', async () => {
    const user = userEvent.setup();
    const close = vi.fn();

    render(<PredictionVoteModal boxersData={boxersData} voteExecution={vi.fn()} close={close} />);

    await user.click(screen.getByRole('button', { name: '投票モーダルを閉じる' }));

    expect(close).toHaveBeenCalledOnce();
  });

  test('戦績とキャンセルボタンを表示しない', () => {
    render(<PredictionVoteModal boxersData={boxersData} voteExecution={vi.fn()} close={vi.fn()} />);

    expect(screen.queryByText(/30勝|61勝/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'キャンセル' })).not.toBeInTheDocument();
  });
});
