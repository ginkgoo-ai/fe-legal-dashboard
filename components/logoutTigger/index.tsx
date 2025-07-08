import { logout } from '@/service/api';

export default function LogoutTrigger({ children }: { children: React.ReactNode }) {
  const handleLogout = () => {
    logout();

    window.postMessage({
      type: 'ginkgoo-page-background-logout',
    });
  };

  return <div onClick={handleLogout}>{children}</div>;
}
