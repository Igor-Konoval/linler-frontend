import { Button } from '@/src/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog';
import { cn } from '@/src/utils/utils';

export function Modal({
  title,
  description,
  children,
  onConfirm,
  onCancel,
  trigger,
  footerButtons,
  contentClassName,
  headerClassName,
  descriptionClassName,
  footerClassName,
  titleClassName,
  open,
  setOpen,
  triggerClassName,
  onOpenAutoFocus,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  trigger?: React.ReactNode;
  footerButtons?: React.ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  descriptionClassName?: string;
  footerClassName?: string;
  titleClassName?: string;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  triggerClassName?: string;
  onOpenAutoFocus?: (event: Event) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger className={triggerClassName} asChild>
          {trigger}
        </DialogTrigger>
      ) : null}
      <DialogContent
        className={cn('sm:max-w-sm', contentClassName)}
        onOpenAutoFocus={onOpenAutoFocus}
      >
        <DialogHeader className={cn(headerClassName)}>
          <DialogTitle className={cn(titleClassName)}>{title}</DialogTitle>
          <DialogDescription className={cn(descriptionClassName)}>
            {description}
          </DialogDescription>
        </DialogHeader>
        {children}
        <DialogFooter className={cn(footerClassName)}>
          {footerButtons ?? (
            <>
              <DialogClose asChild onClick={onCancel}>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="button" onClick={onConfirm}>
                Confirm
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
