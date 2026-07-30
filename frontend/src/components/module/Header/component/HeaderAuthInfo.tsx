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
    <div
      className={clsx(
        'flex min-w-0 items-center',
        device === 'PC' ? 'gap-3' : 'gap-2'
      )}
    >
      <div
        className={clsx(
          'flex min-w-0 flex-1 items-center',
          device === 'PC'
            ? 'gap-3 text-[18px] font-bold text-white/80'
            : 'gap-2 text-[10px] text-white/80'
        )}
      >
        <AiOutlineUser
          className={clsx(
            'mt-[2px] block h-10 w-10 shrink-0 rounded-[50%] border border-white/40 p-2 text-white',
            iconBgColor
          )}
        />
        <span className="min-w-0 truncate">{userName}</span>
      </div>
      {device === 'PC' && <span className="h-10 w-px bg-white/30" />}
      <button
        type="button"
        onClick={onLogout}
        aria-label="ログアウト"
        className={clsx(
          'flex min-h-10 min-w-10 shrink-0 cursor-pointer items-center justify-center rounded-md border border-white/30',
          'text-white/80 transition-opacity hover:opacity-80',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'
        )}
      >
        <AiOutlineLogout className={device === 'PC' ? 'h-7 w-7' : 'h-6 w-6'} />
      </button>
    </div>
  );
};
