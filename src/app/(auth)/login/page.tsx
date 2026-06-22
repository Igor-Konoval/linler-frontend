import { BackButton } from '@/src/components/ui/back-button';
import { LoginForm } from './_components/login-form';

export default async function Page() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <BackButton className="absolute left-4 top-4" />
      <LoginForm />
    </div>
  );
}
