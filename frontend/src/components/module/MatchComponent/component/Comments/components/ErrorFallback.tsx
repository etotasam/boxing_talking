import { CommentsWrapper } from './CommentsWrapper';
import { MdErrorOutline } from 'react-icons/md';

export const ErrorFallback = () => {
  return (
    <>
      <div className="w-full flex justify-center items-center">
        <div>
          <div className="w-full flex justify-center">
            <span className="text-neutral-200/60 text-[70px]">
              <MdErrorOutline />
            </span>
          </div>

          <p className="mt-3 text-neutral-200/80">コメントの取得に失敗しました！</p>
        </div>
      </div>
    </>
  );
};
