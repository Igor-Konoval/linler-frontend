import { BillingService } from '@/src/api/services/client/billing.service';
import { GET_PROJECT_MEMBERS_QUERY_KEY } from '@/src/hooks/projects/use-get-project-members';
import { GET_USER_QUERY_KEY } from '@/src/hooks/user/use-get-user';
import { GET_USER_ACCOUNT_QUERY_KEY } from '@/src/hooks/user/use-get-user-account';
import { GET_WORKSPACE_MEMBERS_QUERY_KEY } from '@/src/hooks/workspaces/use-get-workspace-members';
import {
  type CheckoutSessionResponse,
  type SubscriptionState,
} from '@/src/types/billing.types';
import { type RequestFailure } from '@/src/utils/request-failure.utils';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useRefreshSubscription() {
  const queryClient = useQueryClient();

  return () => {
    void queryClient.invalidateQueries({ queryKey: [GET_USER_QUERY_KEY] });
    void queryClient.invalidateQueries({
      queryKey: [GET_USER_ACCOUNT_QUERY_KEY],
    });
    void queryClient.invalidateQueries({
      queryKey: [GET_WORKSPACE_MEMBERS_QUERY_KEY],
    });
    void queryClient.invalidateQueries({
      queryKey: [GET_PROJECT_MEMBERS_QUERY_KEY],
    });
  };
}

export function useCheckoutSubscription() {
  return useMutation<CheckoutSessionResponse, RequestFailure, void>({
    mutationFn: () => BillingService.checkout(),
  });
}

export function useConfirmSubscription() {
  const refresh = useRefreshSubscription();

  return useMutation<SubscriptionState, RequestFailure, string>({
    mutationFn: (sessionId: string) => BillingService.confirm(sessionId),
    onSuccess: refresh,
  });
}

export function useCancelSubscription() {
  const refresh = useRefreshSubscription();

  return useMutation<SubscriptionState, RequestFailure, void>({
    mutationFn: () => BillingService.cancel(),
    onSuccess: refresh,
  });
}

export function useResumeSubscription() {
  const refresh = useRefreshSubscription();

  return useMutation<SubscriptionState, RequestFailure, void>({
    mutationFn: () => BillingService.resume(),
    onSuccess: refresh,
  });
}
