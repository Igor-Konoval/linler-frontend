import { BackButton } from '@/src/components/ui/back-button';
import { RegisterForm } from './_components/register-form';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create your account',
};

export default async function Page() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <BackButton className="absolute left-4 top-4" />
      <RegisterForm />
    </div>
  );
}
