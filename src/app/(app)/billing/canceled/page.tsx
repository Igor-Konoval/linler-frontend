import { ROUTES } from '@/src/constants/routes.constants';
import Link from 'next/link';

export default function BillingCanceledPage() {
  return (
    <div className="mx-auto flex max-w-lg flex-col gap-3 px-6 py-16">
      <h1 className="text-2xl font-semibold">Checkout canceled</h1>
      <p>You have not been charged. Your subscription was not started.</p>
      <Link className="text-sm underline" href={ROUTES.HOME}>
        Back to Linler
      </Link>
    </div>
  );
}
