import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from './alert-dialog';

interface ConfirmationDialogProps {
  title?: string;
  description?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  trigger?: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  footerClassName?: string;
  footerButtons?: React.ReactNode;
}

export function ConfirmationDialog({
  title,
  description,
  onConfirm,
  onCancel,
  trigger,
  isOpen,
  onOpenChange,
  contentClassName,
  titleClassName,
  descriptionClassName,
  footerClassName,
  footerButtons,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      {trigger ? (
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      ) : null}
      <AlertDialogContent className={contentClassName}>
        <AlertDialogHeader>
          <AlertDialogTitle className={titleClassName}>
            {title ?? 'Are you absolutely sure?'}
          </AlertDialogTitle>
          <AlertDialogDescription className={descriptionClassName}>
            {description ?? 'This action cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className={footerClassName}>
          {footerButtons ?? (
            <>
              <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onConfirm}>
                Continue
              </AlertDialogAction>
            </>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
