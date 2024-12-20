import { CommentsWrapper } from './CommentsWrapper';
import { FaRegPenToSquare } from 'react-icons/fa6';

export const NoCommentFallback = () => {
  return (
    <CommentsWrapper>
      <div className="w-full flex justify-center items-center">
        <div>
          <div className="w-full flex justify-center">
            <div className="relative w-[60px] h-[60px] border-[5px] rounded-[50%] border-neutral-200/30">
              <span className="text-neutral-200/30 text-[30px] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%]">
                <FaRegPenToSquare />
              </span>
            </div>
          </div>

          <p className="mt-3 text-neutral-200/80">まだコメントはありません</p>
        </div>
      </div>
    </CommentsWrapper>
  );
};
