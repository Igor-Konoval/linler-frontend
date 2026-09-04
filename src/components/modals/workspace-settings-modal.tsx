'use client';

import { Modal } from '@/src/components/ui/modal';
import { applyRequestFailureToForm } from '@/src/utils/form-error.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { Button } from '../ui/button';
import { DialogClose } from '../ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormRootMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { useEditWorkspace } from '@/src/hooks/workspaces/use-edit-workspace';
import type { WorkspaceRole } from '@/src/constants/workspaces.constants';
import { isWorkspaceAdmin } from '@/src/utils/workspaces.utils';
import { ConfirmationDialog } from '../ui/confirmation-dialog';
import { useDeleteWorkspace } from '@/src/hooks/workspaces/use-delete-workspace';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/src/constants/routes.constants';
import { useCurrentWorkspaceId } from '@/src/hooks/workspaces/use-current-workspace-id';
import { useLeaveWorkspace } from '@/src/hooks/workspaces/use-leave-workspace';
import { useEffect } from 'react';

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters or longer' })
    .max(120, { message: 'Name must be less than 120 characters' }),
});

export function WorkspaceSettingsModal({
  open,
  setOpen,
  trigger,
  workspaceId,
  workspaceName,
  role,
}: {
  trigger?: React.ReactNode;
  workspaceId: string;
  workspaceName: string;
  role: WorkspaceRole;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const { mutateAsync: editWorkspace, isPending } = useEditWorkspace();
  const { mutateAsync: deleteWorkspace, isPending: isDeleting } =
    useDeleteWorkspace();
  const { mutateAsync: leaveWorkspace, isPending: isLeaving } =
    useLeaveWorkspace();

  const currentWorkspaceId = useCurrentWorkspaceId();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: workspaceName,
    },
  });

  const isAdmin = isWorkspaceAdmin(role);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      if (data.name === workspaceName) {
        form.setError('name', {
          message: 'Workspace name is the same as the current name',
        });
        return;
      }
      const response = await editWorkspace({
        id: workspaceId,
        request: { name: data.name },
      });
      toast.success('Workspace updated successfully');
      form.reset({ name: response.name });
      setOpen(false);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      applyRequestFailureToForm(form, error);
    }
  };

  const handleActionWorkspace = async (action: 'delete' | 'leave') => {
    try {
      if (action === 'delete') {
        await deleteWorkspace(workspaceId);
        toast.success('Workspace deleted successfully');
      } else if (action === 'leave') {
        await leaveWorkspace(workspaceId);
        toast.success(`You have left from ${workspaceName}`);
      }

      if (currentWorkspaceId === workspaceId) {
        router.replace(ROUTES.WORKSPACE);
      }

      setOpen(false);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      applyRequestFailureToForm(form, error);
    }
  };

  useEffect(() => {
    if (open) {
      form.reset({ name: workspaceName });
    }
  }, [open, form, workspaceName]);

  return (
    <Modal
      title="Workspace Settings"
      description="You can edit the workspace name and settings."
      trigger={trigger}
      onOpenAutoFocus={(event) => event.preventDefault()}
      footerButtons={
        <>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            type="submit"
            form="edit-workspace-form"
          >
            Update
          </Button>
        </>
      }
      open={open}
      setOpen={setOpen}
    >
      <Form {...form}>
        <form
          id="edit-workspace-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workspace Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter workspace name"
                    disabled={isPending || !isAdmin}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between gap-2 rounded-xl border border-[#77393938] p-2 dark:border-[#ee757538]">
            <span className="pl-0.5 text-sm text-[#916767] dark:text-[#c26262]">
              Leave from {workspaceName}
            </span>
            <ConfirmationDialog
              title={`Leave from ${workspaceName}`}
              description="Are you sure you want to leave from this workspace? This action cannot be undone."
              onConfirm={() => handleActionWorkspace('leave')}
              trigger={
                <Button isLoading={isPending || isLeaving} variant="secondary">
                  {isLeaving ? 'Leaving...' : 'Leave'}
                </Button>
              }
            ></ConfirmationDialog>
          </div>

          {isAdmin && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-[#af5d5d] bg-[#fff7f7] p-2 dark:border-[#fb5c5c] dark:bg-[#5f00001c]">
              <span className="pl-0.5 text-sm text-[#916767] dark:text-[#b5b5b5]">
                Delete workspace
              </span>
              <ConfirmationDialog
                title="Delete workspace"
                description="Are you sure you want to delete this workspace? This action cannot be undone."
                onConfirm={() => handleActionWorkspace('delete')}
                trigger={
                  <Button
                    variant="destructive"
                    isLoading={isPending || isDeleting}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                }
              />
            </div>
          )}

          {form.formState.errors.root?.message ? (
            <FormRootMessage className="text-red-700">
              {form.formState.errors.root.message}
            </FormRootMessage>
          ) : null}
        </form>
      </Form>
    </Modal>
  );
}
