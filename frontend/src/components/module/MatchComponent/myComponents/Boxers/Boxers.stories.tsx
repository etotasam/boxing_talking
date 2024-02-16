import { Boxers } from './Boxers';
import { StoryObj, Meta } from '@storybook/react';
import { MatchDataType, BoxerType } from '@/assets/types';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MatchContextWrapper } from '../../MatchContainer';
const queryClient = new QueryClient();
// import { action } from '@storybook/addon-actions';

export default {
  title: 'Boxers',
  component: Boxers,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <MatchContextWrapper
          thisMatchPredictionByUser={'blue'}
          isThisMatchAfterToday={true}
        >
          <div className="w-full bg-red-100">
            <Story />
          </div>
        </MatchContextWrapper>
      </QueryClientProvider>
    ),
  ],
} as Meta<typeof Boxers>;

const redBoxer: BoxerType = {
  id: 1,
  name: '名前(赤)',
  eng_name: 'name red',
  birth: '1990-01-01',
  height: 180,
  reach: 182,
  style: 'orthodox',
  country: 'Japan',
  win: 1,
  ko: 1,
  draw: 1,
  lose: 1,
  titles: [],
};
const blueBoxer: BoxerType = {
  id: 1,
  name: '名前(青)',
  eng_name: 'name blue',
  birth: '1990-01-01',
  height: 180,
  reach: 182,
  style: 'orthodox',
  country: 'Japan',
  win: 1,
  ko: 1,
  draw: 1,
  lose: 1,
  titles: [],
};

const testMatch: MatchDataType = {
  id: 1,
  red_boxer: redBoxer,
  blue_boxer: blueBoxer,
  country: 'Japan',
  venue: '場所',
  grade: '10R',
  titles: [],
  weight: 'Lフライ',
  match_date: '2024-01-01',
  count_red: 12,
  count_blue: 11,
  result: null,
};

type Story = StoryObj<typeof Boxers>;
export const Default: Story = {
  args: {
    thisMatch: testMatch,
    showBoxerInfoModal: () => {},
    showPredictionVoteModal: () => {},
    device: 'PC',
    isFetchCommentsLoading: false,
    thisMatchPredictionByUser: 'red',
    isThisMatchAfterToday: true,
  },
};
