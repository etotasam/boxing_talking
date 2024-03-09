import { ToastModal, PropsType } from './ToastModal';
import { StoryObj, Meta } from '@storybook/react';
import { BG_COLOR_ON_TOAST_MODAL, MESSAGE } from '@/assets/statusesOnToastModal';
// ! Recoil
import { RecoilRoot } from 'recoil';

export default {
  title: 'modal/ToastModal',
  component: ToastModal,
  tags: ['autodocs'],
  argTypes: {
    bgColor: {
      options: Object.values(BG_COLOR_ON_TOAST_MODAL),
      control: 'select',
    },
    messageOnToast: {
      options: Object.values(MESSAGE),
      control: 'select',
    },
  },
  parameters: {},
  decorators: [
    (Story) => (
      <div className="h-[100px] bg-neutral-400">
        <RecoilRoot>
          <Story />
        </RecoilRoot>
      </div>
    ),
  ],
} as Meta<typeof ToastModal>;

const props: PropsType = {
  hideToastModal: () => {},
  bgColor: BG_COLOR_ON_TOAST_MODAL.ERROR,
  messageOnToast: MESSAGE.ALREADY_HAVE_DONE_VOTE,
};

type Story = StoryObj<typeof ToastModal>;
export const Default: Story = {
  args: {
    ...props,
  },
};
