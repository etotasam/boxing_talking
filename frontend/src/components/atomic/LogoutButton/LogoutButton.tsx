import { IoMdLogOut } from 'react-icons/io';
import {
  useLogout,
  useGuestLogout,
  useAuth,
  useGuest,
} from '@/hooks/apiHooks/useAuth';

export const LogoutButton = () => {
  const { data: authUser } = useAuth();
  const { data: isGuest } = useGuest();
  const { logout } = useLogout();
  const { guestLogout } = useGuestLogout();

  return (
    <button
      className="w-[30px] h-[30px] text-white bg-stone-400 hover:bg-stone-700 text-transparent hover:text-black duration-300 rounded-[50%] text-[18px] hover:text-[20px] relative flex justify-center items-center after:min-w-[100px] lg:after:content-['ログアウト'] after:text-[10px] after:absolute after:bottom-[-14px] after:left-[50%] after:translate-x-[-50%]"
      onClick={authUser ? logout : isGuest ? guestLogout : () => {}}
      type="button"
    >
      <span className="text-white block">
        <IoMdLogOut />
      </span>
    </button>
  );
};
