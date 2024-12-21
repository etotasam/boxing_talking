//! recoil
import { useRecoilValue } from 'recoil';
import { elementSizeState } from '@/store/elementSizeState';

const AdminOnlyLayout = ({ children }: { children: React.ReactNode }) => {
  const headerHeight = useRecoilValue(elementSizeState('HEADER_HEIGHT'));

  return (
    <>
      <main
        className="bg-white h-[100vh] overflow-auto"
        style={{ paddingTop: `${headerHeight}px` }}
      >
        <div>{children}</div>
      </main>
    </>
  );
};

export default AdminOnlyLayout;
