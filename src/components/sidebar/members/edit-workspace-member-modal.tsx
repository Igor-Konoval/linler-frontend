'use client';

import { Button } from '@/src/components/ui/button';
import { DialogClose } from '@/src/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormRootMessage,
} from '@/src/components/ui/form';
import { Modal } from '@/src/components/ui/modal';
import {
  WorkspaceMemberStatus,
  WorkspaceRole,
} from '@/src/constants/workspaces.constants';
import { useDeleteWorkspaceMember } from '@/src/hooks/member/use-delete-workspace-member';
import { useEditWorkspaceMember } from '@/src/hooks/member/use-edit-workspace-member';
import { useGetWorkspaceRole } from '@/src/hooks/use-get-workspace-role';
import { WorkspaceMemberResponse } from '@/src/types/workspaces.types';
import { applyRequestFailureToForm } from '@/src/utils/form-error.utils';
import { isWorkspaceAdmin } from '@/src/utils/workspaces.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ConfirmationDialog } from '../../ui/confirmation-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';

const formSchema = z.object({
  role: z.enum(Object.values(WorkspaceRole) as [string, ...string[]]),
  status: z.enum(Object.values(WorkspaceMemberStatus) as [string, ...string[]]),
});

export function EditWorkspaceMemberModal({
  trigger,
  workspaceId,
  member,
}: {
  trigger: React.ReactNode;
  member: WorkspaceMemberResponse;
  workspaceId: string;
}) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: editWorkspaceMember, isPending } =
    useEditWorkspaceMember();
  const { mutateAsync: deleteWorkspaceMember, isPending: isDeleting } =
    useDeleteWorkspaceMember();

  const workspaceRole = useGetWorkspaceRole(workspaceId);
  const isAdmin = isWorkspaceAdmin(workspaceRole);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: member.role,
      status: member.status,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await editWorkspaceMember({
        id: workspaceId,
        userId: member.userId,
        request: {
          role: data.role as WorkspaceRole,
          status: data.status as WorkspaceMemberStatus,
        },
      });
      toast.success('Member updated successfully');
      form.reset({
        role: response.role,
        status: response.status,
      });
      setOpen(false);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      applyRequestFailureToForm(form, error);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteWorkspaceMember({
        id: workspaceId,
        userId: member.userId,
      });
      toast.success('Member deleted successfully');
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
      form.reset({
        role: member.role,
        status: member.status,
      });
    }
  }, [open, member, form]);

  return (
    <Modal
      title="Member settings"
      description="You can change the member settings."
      trigger={trigger}
      contentClassName="max-w-[700px]!"
      onOpenAutoFocus={(event) => event.preventDefault()}
      triggerClassName="right-px! top-px!"
      footerButtons={
        <>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            disabled={!form.formState.isDirty}
            type="submit"
            form="edit-workspace-member-form"
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
          id="edit-workspace-member-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Select
                    disabled={
                      isPending ||
                      !isAdmin ||
                      member.role === WorkspaceRole.OWNER
                    }
                    value={field.value || ''}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem disabled value={WorkspaceRole.OWNER}>
                        Owner
                      </SelectItem>
                      <SelectItem value={WorkspaceRole.ADMIN}>Admin</SelectItem>
                      <SelectItem value={WorkspaceRole.MEMBER}>
                        Member
                      </SelectItem>
                      <SelectItem value={WorkspaceRole.VIEWER}>
                        Viewer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <Select
                    disabled={
                      isPending ||
                      !isAdmin ||
                      member.role === WorkspaceRole.OWNER
                    }
                    value={field.value || ''}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value={WorkspaceMemberStatus.ACTIVE}>
                        Active
                      </SelectItem>
                      <SelectItem value={WorkspaceMemberStatus.SUSPENDED}>
                        Suspended
                      </SelectItem>
                      <SelectItem value={WorkspaceMemberStatus.LEFT}>
                        Left
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />

          {isAdmin && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-[#af5d5d] bg-[#fff7f7] p-2 dark:border-[#fb5c5c] dark:bg-[#5f00001c]">
              <span className="pl-0.5 text-sm text-[#916767] dark:text-[#b5b5b5]">
                Delete member
              </span>
              <ConfirmationDialog
                title="Delete member"
                description="Are you sure you want to delete this member? This action cannot be undone."
                onConfirm={handleDeleteProject}
                trigger={
                  <Button
                    variant="destructive"
                    isLoading={isPending || isDeleting}
                    disabled={member.role === WorkspaceRole.OWNER}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </Button>
                }
              ></ConfirmationDialog>
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
