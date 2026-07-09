import clsx from 'clsx';
import { AiOutlineLogout, AiOutlineUser } from 'react-icons/ai';
import { useRecoilValue } from 'recoil';
import { DeviceStateType, deviceState } from '@/store/deviceState';
import { useHeaderAuthInfo } from '../hooks/useHeaderAuthInfo';

export const HeaderAuthInfo = () => {
  const device = useRecoilValue(deviceState);
  const authInfo = useHeaderAuthInfo();

  if (!authInfo) return null;

  return <HeaderAuthInfoView {...authInfo} device={device} />;
};

type HeaderAuthInfoViewProps = {
  device: DeviceStateType;
  userName: string;
  iconBgColor: string;
  onLogout: () => void;
};

export const HeaderAuthInfoView = ({
  device,
  userName,
  iconBgColor,
  onLogout,
}: HeaderAuthInfoViewProps) => {
  return (
    <div className="flex">
      <button
        type="button"
        onClick={onLogout}
        aria-label="ログアウト"
        className={clsx(
          'group/user relative flex items-center rounded-md text-[10px] transition-opacity',
          'pc:gap-3 pc:text-[18px] pc:font-bold pc:text-white/80',
          'hover:opacity-80 cursor-pointer'
        )}
      >
        <AiOutlineUser
          className={clsx(
            'mr-1 mt-[2px] block h-[16px] w-[16px] rounded-[50%] text-white',
            'pc:mr-0 pc:h-10 pc:w-10 pc:border pc:border-white/40 pc:bg-neutral-900 pc:p-2',
            iconBgColor
          )}
        />
        <span className="hidden pc:inline">{userName}</span>
        {device === 'PC' && (
          <>
            <span className="h-10 w-px bg-white/30" />
            <AiOutlineLogout className="h-7 w-7 text-white/80" />
          </>
        )}
        {device === 'PC' && (
          <span
            className={clsx(
              'pointer-events-none absolute left-0 top-full mt-1',
              'whitespace-nowrap rounded-md bg-neutral-900 px-3 py-[6px] text-[10px] font-medium text-white shadow-lg',
              'after:absolute after:left-3 after:bottom-full after:h-0 after:w-0',
              'after:border-x-[6px] after:border-b-[6px] after:border-x-transparent after:border-b-neutral-900',
              'opacity-0 transition-opacity duration-200 group-hover/user:opacity-100'
            )}
          >
            ログアウト
          </span>
        )}
      </button>
    </div>
  );
};
