'use client';

import {
  useCancelSubscription,
  useCheckoutSubscription,
  useResumeSubscription,
} from '@/src/hooks/billing/use-billing';
import { useGetUser } from '@/src/hooks/user/use-get-user';
import { Button } from '@/src/components/ui/button';
import {
  AlertDialogAction,
  AlertDialogCancel,
} from '@/src/components/ui/alert-dialog';
import { ConfirmationDialog } from '@/src/components/ui/confirmation-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/src/components/ui/dialog';
import { toast } from 'sonner';

function formatPeriodEnd(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat('en', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function SubscriptionDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: user } = useGetUser();
  const checkout = useCheckoutSubscription();
  const cancel = useCancelSubscription();
  const resume = useResumeSubscription();
  const periodEnd = formatPeriodEnd(user?.subscriptionCurrentPeriodEnd);
  const active = Boolean(user?.subscriptionActive);
  const renewalCanceled = Boolean(user?.subscriptionCancelAtPeriodEnd);
  const pending = checkout.isPending || cancel.isPending || resume.isPending;

  const startCheckout = async () => {
    try {
      const result = await checkout.mutateAsync();
      window.location.assign(result.url);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Could not open Stripe checkout.',
      );
    }
  };

  const cancelRenewal = async () => {
    try {
      await cancel.mutateAsync();
      toast.success('Renewal is canceled. The current period is not refunded.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not cancel renewal.',
      );
    }
  };

  const resumeRenewal = async () => {
    try {
      await resume.mutateAsync();
      toast.success('Renewal is on again.');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Could not resume renewal.',
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Linler subscription</DialogTitle>
          <DialogDescription>
            Subscribe to turn on the AI assistant for as long as the
            subscription stays active.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <p>The assistant can:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Help you generate content on pages</li>
            <li>Keep track of analytics for your projects</li>
            <li>
              Answer questions about your account, such as notifications and
              other personal activity
            </li>
          </ul>
          <p>
            The subscription renews until you cancel it. Canceling stops the
            next renewal. It does not refund the current period. The assistant
            stays available until that period ends.
          </p>
          <p className="text-muted-foreground">
            Payments use Stripe test mode. A test card such as 4242 4242 4242
            4242 is enough.
          </p>
          {active && !renewalCanceled ? (
            <p>
              Your subscription is active
              {periodEnd ? ` until ${periodEnd}` : ''}.
            </p>
          ) : null}
          {active && renewalCanceled ? (
            <p>
              Renewal is canceled
              {periodEnd ? `. Access remains until ${periodEnd}` : ''}. You will
              not be refunded.
            </p>
          ) : null}
        </div>
        <DialogFooter>
          {active && renewalCanceled ? (
            <Button type="button" disabled={pending} onClick={resumeRenewal}>
              Resume renewal
            </Button>
          ) : null}
          {active && !renewalCanceled ? (
            <ConfirmationDialog
              title="Cancel subscription?"
              description="Are you sure you want to cancel your subscription? Canceling stops the next renewal and does not refund the current period."
              footerButtons={
                <>
                  <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      void cancelRenewal();
                    }}
                  >
                    Cancel renewal
                  </AlertDialogAction>
                </>
              }
              trigger={
                <Button type="button" variant="destructive" disabled={pending}>
                  Cancel renewal
                </Button>
              }
            />
          ) : null}
          {!active ? (
            <Button type="button" disabled={pending} onClick={startCheckout}>
              Subscribe with Stripe
            </Button>
          ) : null}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
