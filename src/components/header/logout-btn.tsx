'use client';

import { useLogout } from '@/src/hooks/auth/use-logout';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';

export function LogoutBtn() {
  const { mutateAsync: logout, isPending } = useLogout();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.refresh();
  };

  return (
    <Button
      className="h-auto w-full justify-start px-1.5 py-1"
      onClick={handleLogout}
      isLoading={isPending}
      variant="ghost"
    >
      Logout
    </Button>
  );
}
