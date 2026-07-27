'use client';

import { Button } from '@/src/components/ui/button';
import { PlusIcon } from 'lucide-react';
import { AddWorkspaceModal } from '../modals/add-workspace-modal';

export function AddWorkspaceButton() {
  return (
    <AddWorkspaceModal
      trigger={
        <Button
          variant="ghost"
          className="text-muted-foreground hover:bg-(--sidebar-item-hover)! w-full justify-start rounded-md pl-4 text-[13px]"
        >
          <PlusIcon className="h-4 w-4" /> Add Workspace
        </Button>
      }
    />
  );
}
