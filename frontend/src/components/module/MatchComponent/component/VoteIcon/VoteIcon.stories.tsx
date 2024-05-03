import { VoteIcon } from './VoteIcon';
import { StoryObj, Meta } from '@storybook/react';
// import { action } from '@storybook/addon-actions';

const COLOR = [
  '',
  'text-neutral-800',
  'text-neutral-700',
  'text-neutral-600',
  'text-neutral-500',
  'text-neutral-400',
  'text-neutral-300',
  'text-neutral-200',
  'text-neutral-100',
  'text-neutral-50',
] as const;

export default {
  title: 'Match/VoteIcon',
  component: VoteIcon,
  tags: ['autodocs'],
  parameters: {},
  argTypes: {
    color: {
      options: COLOR,
      control: 'select',
    },
    isScroll: {
      options: [true, false],
      control: 'radio',
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full flex justify-center items-center">
        <div className="w-[80%] bg-neutral-800 p-5 flex justify-center items-center">
          <Story />
        </div>
      </div>
    ),
  ],
} as Meta<typeof VoteIcon>;

type Story = StoryObj<typeof VoteIcon>;
export const Default: Story = {
  args: {
    color: 'text-neutral-200',
    showPredictionModal: () => {},
  },
};
