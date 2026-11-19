'use client';

import { SubscriptionDialog } from '@/src/components/billing/subscription-dialog';
import { Button } from '@/src/components/ui/button';
import { UserAvatar } from '@/src/components/user-avatar';
import { UserName } from '@/src/components/user-name';
import { useGetUser } from '@/src/hooks/user/use-get-user';
import { useState } from 'react';

export function SidebarAccount() {
  const { data: user } = useGetUser();
  const [open, setOpen] = useState(false);

  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2 group-data-[collapsible=icon]:hidden">
      <div className="flex min-w-0 items-center gap-2 px-1">
        <UserAvatar
          username={user.username}
          avatarUrl={user.avatarUrl}
          size={28}
          className="h-7 w-7"
        />
        <div className="min-w-0">
          <UserName
            name={user.username}
            subscribed={user.subscriptionActive}
            className="text-sm font-medium"
          />
          <p className="text-muted-foreground truncate text-xs">
            {user.subscriptionActive ? 'Subscribed' : 'No subscription'}
          </p>
        </div>
      </div>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-start"
        onClick={() => setOpen(true)}
      >
        Subscription
      </Button>
      <SubscriptionDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
