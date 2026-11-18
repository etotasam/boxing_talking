import { RotatingLines } from 'react-loader-spinner';

export const FullScreenSpinnerModal = ({ isShow }: { isShow: boolean }) => {
  return (
    <>
      {isShow && (
        <div
          className={`z-50 w-[100vw] h-[100vh] fixed top-0 left-0 flex justify-center items-center bg-base-bg/90`}
        >
          <RotatingLines strokeColor="#ffffff" strokeWidth="3" animationDuration="1" width="60" />
        </div>
      )}
    </>
  );
};
