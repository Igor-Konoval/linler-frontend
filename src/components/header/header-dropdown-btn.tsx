'use client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Ellipsis } from 'lucide-react';
import { EditAccountSheet } from '../edit-account-sheet';
import { useState } from 'react';
import { LogoutBtn } from './logout-btn';

export function HeaderDropdownBtn() {
  const [isOpen, setIsOpen] = useState(false);
  const [isAccountSheetOpen, setIsAccountSheetOpen] = useState(false);

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger className="px-1" asChild>
          <Button variant="ghost">
            <Ellipsis />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuGroup>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => setIsAccountSheetOpen(true)}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem className="p-0">
              <LogoutBtn />
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      {isAccountSheetOpen && (
        <EditAccountSheet
          open={isAccountSheetOpen}
          onOpenChange={(open) => {
            setIsAccountSheetOpen(open);

            if (!open) {
              setIsOpen(false);
            }
          }}
        />
      )}
    </>
  );
}
