import { Background } from '@/components/module/Background';
import { Outlet } from 'react-router-dom';
//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
const ContentLayout = () => {
  // ! use hook
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));

  return (
    <>
      <Background />
      <main
        style={{
          paddingTop: `${headerHeight}px`,
        }}
      >
        <Outlet />
      </main>
    </>
  );
};

export default ContentLayout;
