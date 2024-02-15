import type { Meta, StoryObj } from '@storybook/react';
import { PredictionVoteModal } from './PredictionVoteModal';

export default {
  title: 'PredictionVoteModal',
  component: PredictionVoteModal,
  parameters: {},
  // decorators: [
  //   (Story) => (
  //     <div className="w-full flex justify-center items-center">
  //       <div className="w-[80%] bg-stone-300 p-5">
  //         <p>width 80%</p>
  //         <p>padding 5</p>
  //         <Story />
  //       </div>
  //     </div>
  //   ),
  // ],
} as Meta<typeof PredictionVoteModal>;

type Story = StoryObj<typeof PredictionVoteModal>;
export const Element: Story = {
  args: {
    boxersData: {
      red: { name: 'ティム・チュー', country: 'Australia', title: 0 },
      blue: { name: 'ライアン・ガルシア', country: 'USA', title: 2 },
    },
    voteExecution: () => {},
    close: () => {},
  },
};
