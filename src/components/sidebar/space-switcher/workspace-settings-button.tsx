'use client';

import { Button } from '@/src/components/ui/button';
import { Settings } from 'lucide-react';

export function WorkspaceSettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="outline"
      size="icon"
      type="button"
      className="h-auto w-auto p-2"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
    >
      <Settings className="h-3! w-3!" />
    </Button>
  );
}
