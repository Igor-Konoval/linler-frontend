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
import { ProjectVisibility } from '@/src/constants/projects.constants';
import { useCreateProject } from '@/src/hooks/projects/use-create-project';
import { useGetWorkspaceRole } from '@/src/hooks/use-get-workspace-role';
import { applyRequestFailureToForm } from '@/src/utils/form-error.utils';
import { isWorkspaceAdmin } from '@/src/utils/workspaces.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: 'Name must be at least 1 characters or longer' })
    .max(160, { message: 'Name must be less than 160 characters' }),
  icon: z
    .string()
    .trim()
    .refine((value) => !value || [...(value || '')].length === 1, {
      message: 'Icon must be a single emoji or symbol.',
    })
    .nullable(),
  description: z
    .string()
    .trim()
    .max(2000, { message: 'Description must be less than 2000 characters' })
    .nullable(),
  visibility: z.enum(Object.values(ProjectVisibility) as [string, ...string[]]),
});

export function CreateProjectModal({
  trigger,
  triggerClassName,
  workspaceId,
  visibility,
}: {
  trigger: React.ReactNode;
  triggerClassName?: string;
  workspaceId: string;
  visibility: ProjectVisibility;
}) {
  const [open, setOpen] = useState(false);
  const { mutateAsync: createProject, isPending } = useCreateProject();

  const workspaceRole = useGetWorkspaceRole(workspaceId);
  const isAdmin = isWorkspaceAdmin(workspaceRole);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      icon: null,
      description: null,
      visibility: visibility,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await createProject({
        workspaceId,
        request: {
          name: data.name,
          icon: data.icon,
          description: data.description,
          visibility: data.visibility as ProjectVisibility,
        },
      });
      toast.success('Project created successfully');
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

  const handleCreateProjectSubmit = form.handleSubmit(onSubmit);

  return (
    <Modal
      title="Create project"
      description="You can create a new project."
      trigger={trigger}
      triggerClassName={triggerClassName}
      contentClassName="max-w-[700px]!"
      footerButtons={
        <>
          <DialogClose asChild>
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            disabled={!form.formState.isDirty}
            type="submit"
            form="create-project-form"
          >
            Create
          </Button>
        </>
      }
      open={open}
      setOpen={setOpen}
    >
      <Form {...form}>
        <form
          id="create-project-form"
          onSubmit={(event) => {
            if (event.target !== event.currentTarget) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }

            void handleCreateProjectSubmit(event);
          }}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter project name"
                    disabled={isPending || !isAdmin}
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Icon</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter project icon (e.g. 🚀)"
                    disabled={isPending || !isAdmin}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter project description"
                    disabled={isPending || !isAdmin}
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
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
