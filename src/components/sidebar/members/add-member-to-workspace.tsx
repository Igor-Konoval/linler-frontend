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
import { Input } from '@/src/components/ui/input';
import { Modal } from '@/src/components/ui/modal';
import { WorkspaceRole } from '@/src/constants/workspaces.constants';
import { useAddMemberToWorkspace } from '@/src/hooks/member/use-add-member-to-workspace';
import { applyRequestFailureToForm } from '@/src/utils/form-error.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { useGetWorkspaceRole } from '@/src/hooks/use-get-workspace-role';
import { isWorkspaceAdmin } from '@/src/utils/workspaces.utils';

const formSchema = z.object({
  email: z.string().email().trim(),
  role: z
    .enum(Object.values(WorkspaceRole) as [string, ...string[]])
    .default(WorkspaceRole.MEMBER),
});

export function AddMemberToWorkspaceModal({
  trigger,
  workspaceId,
}: {
  trigger: React.ReactNode;
  workspaceId: string;
}) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: addMemberToWorkspace, isPending } =
    useAddMemberToWorkspace();

  const workspaceRole = useGetWorkspaceRole(workspaceId);
  const isAdmin = isWorkspaceAdmin(workspaceRole);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      role: WorkspaceRole.MEMBER,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await addMemberToWorkspace({
        workspaceId,
        request: {
          email: data.email,
          role: data.role as WorkspaceRole,
        },
      });
      toast.success('Member added to workspace');
      form.reset();
      setOpen(false);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      applyRequestFailureToForm(form, error);
    }
  };

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  return (
    <Modal
      title="Add member to workspace"
      description="You can add a new member to the workspace."
      trigger={trigger}
      contentClassName="max-w-[700px]!"
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
            form="add-member-to-workspace-form"
          >
            Create
          </Button>
        </>
      }
      open={open}
      setOpen={setOpen}
      onOpenAutoFocus={(event) => event.preventDefault()}
    >
      <Form {...form}>
        <form
          id="add-member-to-workspace-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter email"
                    disabled={isPending || !isAdmin}
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <FormControl>
                  <Select
                    disabled={isPending || !isAdmin}
                    value={field.value || ''}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent position="popper">
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
