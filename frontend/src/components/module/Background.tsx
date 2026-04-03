import clsx from 'clsx';
import { useLocation } from 'react-router-dom';
import { ROUTE_PATH } from '@/assets/routePath';
// ! images
import boxingMatch from '@/assets/images/etc/boxing_match.jpg';
import ManOnTheRing from '@/assets/images/etc/man_on_the_ring.jpg';
import GGGPhoto from '@/assets/images/etc/GGG.jpg';
import Grove from '@/assets/images/etc/black_grove.jpg';

export const Background = () => {
  const { pathname } = useLocation();
  // const isPC = device === 'PC';
  const getBackgroundImage = () => {
    switch (pathname) {
      case ROUTE_PATH.HOME:
        return boxingMatch;
      case ROUTE_PATH.PAST_MATCHES:
        return ManOnTheRing;
      case ROUTE_PATH.MATCH:
        return Grove;
      case ROUTE_PATH.PAST_MATCH_SINGLE:
        return GGGPhoto;
      default:
        return boxingMatch;
    }
  };
  return (
    <div
      className={clsx('fixed bg-fixed w-full h-[100vh] overflow-auto')}
      style={{
        backgroundImage: `url(${getBackgroundImage()})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        className={clsx(
          'bg-fixed w-full h-[100vh] bg-base-bg/90 backdrop-blur-[1px] overflow-auto'
        )}
      />
    </div>
  );
};
