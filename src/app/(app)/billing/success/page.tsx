'use client';

import { useConfirmSubscription } from '@/src/hooks/billing/use-billing';
import { ROUTES } from '@/src/constants/routes.constants';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useRef } from 'react';

function BillingSuccessContent() {
  const params = useSearchParams();
  const sessionId = params.get('session_id');
  const confirm = useConfirmSubscription();
  const started = useRef(false);

  useEffect(() => {
    if (!sessionId || started.current) {
      return;
    }

    started.current = true;
    void confirm.mutate(sessionId);
  }, [confirm, sessionId]);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-3 px-6 py-16">
      <h1 className="text-2xl font-semibold">Subscription</h1>
      {confirm.isPending ? <p>Confirming your Stripe test payment...</p> : null}
      {confirm.isSuccess ? (
        <p>
          Your subscription is active. The AI assistant is included for this
          period.
        </p>
      ) : null}
      {confirm.isError ? <p>{confirm.error.message}</p> : null}
      {!sessionId ? <p>Stripe did not return a checkout session.</p> : null}
      <Link className="text-sm underline" href={ROUTES.HOME}>
        Back to Linler
      </Link>
    </div>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={<p className="px-6 py-16">Confirming your subscription...</p>}
    >
      <BillingSuccessContent />
    </Suspense>
  );
}
