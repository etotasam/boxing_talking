import type { Meta, StoryObj } from '@storybook/react';
import { PredictionVoteModal } from './PredictionVoteModal';

export default {
  title: 'PredictionVoteModal',
  component: PredictionVoteModal,
  parameters: {},
  //   (Story) => (
} as Meta<typeof PredictionVoteModal>;

type Story = StoryObj<typeof PredictionVoteModal>;
export const Element: Story = {
  args: {
    boxersData: {
      red: { name: 'ティム・チュー', country: 'Australia' },
      blue: { name: 'ライアン・ガルシア', country: 'USA' },
    },
    voteExecution: () => {},
    close: () => {},
  },
};
