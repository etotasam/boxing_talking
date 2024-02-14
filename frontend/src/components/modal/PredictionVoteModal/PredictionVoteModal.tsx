import { MatchDataType } from '@/assets/types';

type PredictionVoteModalType = {
  thisMatch: MatchDataType;
  voteExecution: (color: 'red' | 'blue') => void;
  cancel: () => void;
};
export const PredictionVoteModal = ({
  thisMatch,
  voteExecution,
  cancel,
}: PredictionVoteModalType) => {
  return (
    <>
      <div className="z-20 fixed top-0 left-0 w-full h-[100vh] flex justify-center items-center">
        <div className="px-10 py-5 bg-white border-[1px] border-stone-400 shadow-lg shadow-stone-500/50">
          <p className="text-center text-stone-600">
            どちらが勝つと思いますか？
          </p>
          <div className="flex justify-between mt-5">
            <button
              onClick={() => voteExecution('red')}
              className="bg-white border-[1px] border-stone-400 text-stone-600 duration-300 py-1 px-5 mr-5 rounded-[25px] text-sm"
            >
              {thisMatch.red_boxer.name}
            </button>
            <button
              onClick={() => voteExecution('blue')}
              className="bg-white border-[1px] border-stone-400 text-stone-600 duration-300 py-1 px-5 ml-5 rounded-[25px] text-sm"
            >
              {thisMatch.blue_boxer.name}
            </button>
          </div>

          <div className="mt-5 flex justify-center items-center">
            <button
              onClick={cancel}
              className="max-w-[500px] w-full  bg-stone-600 text-white  py-1 rounded-sm"
            >
              わからない
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
