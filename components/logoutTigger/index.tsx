import { logout } from '@/service/api';

export default function LogoutTrigger({ children }: { children: React.ReactNode }) {
  const handleLogout = () => {
    logout();
  };

  return <div onClick={handleLogout}>{children}</div>;
}
