import { Outlet } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';
import { Header } from '@/components/module/Header';
const HeaderOnlyLayout = () => {
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));
  return (
    <div className="text-stone-700">
      <Header />
      <main
        style={{
          minHeight: `calc(100vh - (${headerHeight}px)`,
        }}
      >
        <Outlet />
        {/* {children} */}
      </main>
    </div>
  );
};

export default HeaderOnlyLayout;
