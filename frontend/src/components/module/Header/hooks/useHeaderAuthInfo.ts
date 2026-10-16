import { useAuth, useGuest, useGuestLogout, useLogout } from '@/hooks/apiHooks/auth';

export const useHeaderAuthInfo = () => {
  const { data: isGuest } = useGuest();
  const { data: authUser } = useAuth();
  const { logout } = useLogout();
  const { guestLogout } = useGuestLogout();

  if (!isGuest && !authUser) return null;

  return {
    userName: authUser ? authUser.name ?? '' : 'ゲスト',
    onLogout: authUser ? logout : guestLogout,
  };
};
