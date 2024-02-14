import { Button } from './Button';
import { StoryObj, Meta } from '@storybook/react';
// import { action } from '@storybook/addon-actions';

export default {
  title: 'Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {},
  decorators: [
    (Story) => (
      <div className="w-full flex justify-center items-center">
        <div className="w-[80%] bg-stone-300 p-5">
          <p>width 80%</p>
          <p>padding 5</p>
          <Story />
        </div>
      </div>
    ),
  ],
} as Meta<typeof Button>;

type Story = StoryObj<typeof Button>;
export const Default: Story = {
  args: {
    styleName: 'default',
    children: 'テキスト',
  },
};
