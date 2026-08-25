'use client';

import { Modal } from '@/src/components/ui/modal';
import { useCreateWorkspace } from '@/src/hooks/workspaces/use-create-workspace';
import { applyRequestFailureToForm } from '@/src/utils/form-error.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
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

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: 'Name must be at least 2 characters or longer' })
    .max(120, { message: 'Name must be less than 120 characters' }),
});

export function AddWorkspaceModal({ trigger }: { trigger: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createWorkspace, isPending } = useCreateWorkspace();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await createWorkspace({ name: data.name });
      toast.success('Workspace created successfully');
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
      title="Add a new workspace"
      description="You can collaborate with your team on a project by adding a new workspace."
      trigger={trigger}
      footerButtons={
        <>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </DialogClose>
          <Button isLoading={isPending} type="submit" form="add-workspace-form">
            Create
          </Button>
        </>
      }
      open={open}
      setOpen={setOpen}
    >
      <Form {...form}>
        <form
          id="add-workspace-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
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
                    disabled={isPending}
                    {...field}
                  />
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
