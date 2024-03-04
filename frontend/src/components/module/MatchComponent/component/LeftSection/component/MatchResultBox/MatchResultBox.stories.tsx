import type { Meta, StoryObj } from '@storybook/react';
import { MatchResultBox } from './MatchResultBox';
import { MatchDataType, MatchResultType, BoxerType } from '@/assets/types';

export default {
  title: 'Match/LeftSection/MatchResultBox',
  component: MatchResultBox,
  parameters: {},
  tags: ['autodocs'],
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
} as Meta<typeof MatchResultBox>;

const redBoxer: BoxerType = {
  id: 1,
  name: 'なまえ赤',
  engName: 'name_red',
  birth: '1990-01-10',
  height: 180,
  reach: 180,
  style: 'orthodox',
  country: 'Ghana',
  win: 12,
  ko: 12,
  draw: 1,
  lose: 1,
  titles: [
    {
      organization: 'WBA',
      weight: 'ウェルター',
    },
  ],
};

const blueBoxer: BoxerType = {
  id: 1,
  name: 'なまえ青',
  engName: 'name_blue',
  birth: '1990-01-10',
  height: 180,
  reach: 180,
  style: 'orthodox',
  country: 'Ghana',
  win: 12,
  ko: 12,
  draw: 1,
  lose: 1,
  titles: [
    {
      organization: 'WBA',
      weight: 'ウェルター',
    },
  ],
};

const testResult: MatchResultType = {
  matchId: 1,
  result: 'blue',
  detail: 'sd',
  round: undefined,
};

const testMatchData: MatchDataType = {
  id: 1,
  redBoxer: redBoxer,
  blueBoxer: blueBoxer,
  country: 'Japan',
  venue: '会場',
  grade: '10R',
  titles: [],
  weight: 'ウェルター',
  matchDate: '2024-03-04',
  result: testResult,
};

type Story = StoryObj<typeof MatchResultBox>;
export const Element: Story = {
  args: {
    matchData: testMatchData,
  },
};
