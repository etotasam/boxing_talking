//! layout
import HeaderAndFooterLayout from '@/layout/HeaderAndFooterLayout';
// ! components
import { Matches } from '@/components/module/Matches';
// ! hooks
import { useWindowSize } from '@/hooks/useWindowSize';

export const Home = () => {
  const { device } = useWindowSize();

  return (
    <>
      <HeaderAndFooterLayout>
        <Matches />
      </HeaderAndFooterLayout>
    </>
  );
};
