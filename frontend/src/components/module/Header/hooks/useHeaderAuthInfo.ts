import { useAuth, useGuest, useGuestLogout, useLogout } from '@/hooks/apiHooks/useAuth';

export const useHeaderAuthInfo = () => {
  const { data: isGuest } = useGuest();
  const { data: authUser } = useAuth();
  const { logout } = useLogout();
  const { guestLogout } = useGuestLogout();

  if (!isGuest && !authUser) return null;

  return {
    userName: authUser ? authUser.name ?? '' : 'ゲスト',
    iconBgColor: authUser ? 'bg-cyan-700' : 'bg-stone-400',
    onLogout: authUser ? logout : guestLogout,
  };
};
