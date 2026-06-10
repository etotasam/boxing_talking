import { Background } from '@/components/module/Background';
import { Outlet } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
const ContentLayout = () => {
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));

  return (
    <>
      <Background />
      <main
        style={{
          paddingTop: `${headerHeight}px`,
        }}
        className="max-w-[1200px] w-[96%] pc:w-[92%] mx-auto"
      >
        <Outlet />
      </main>
    </>
  );
};

export default ContentLayout;
