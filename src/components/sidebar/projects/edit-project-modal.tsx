'use client';

import { Modal } from '@/src/components/ui/modal';
import { applyRequestFailureToForm } from '@/src/utils/form-error.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
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
import { Button } from '@/src/components/ui/button';
import { DialogClose } from '@/src/components/ui/dialog';
import { ConfirmationDialog } from '../../ui/confirmation-dialog';
import { ProjectVisibility } from '@/src/constants/projects.constants';
import type { ProjectResponse } from '@/src/types/projects.types';
import { useEditProject } from '@/src/hooks/projects/use-edit-project';
import { isWorkspaceAdmin } from '@/src/utils/workspaces.utils';
import { useDeleteProject } from '@/src/hooks/projects/use-delete-project';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../ui/select';
import { Switch } from '../../ui/toggle';
import { SettingsProjectMembersSection } from './settings-project-members-section';
import { useGetWorkspaceRole } from '@/src/hooks/use-get-workspace-role';
import { CreateProjectPageModal } from '../project-pages/create-project-page-modal';
import { FileText } from 'lucide-react';

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
  orderIndex: z.number().min(0, { message: 'Order index must be at least 0' }),
  archived: z.boolean().default(false),
});

export function SettingsProjectModal({
  trigger,
  project,
}: {
  trigger: React.ReactNode;
  project: ProjectResponse;
}) {
  const [open, setOpen] = useState(false);
  const [openPageModal, setOpenPageModal] = useState(false);
  const formId = useId();
  const { mutateAsync: editProject, isPending } = useEditProject();
  const { mutateAsync: deleteProject, isPending: isDeleting } =
    useDeleteProject();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: project.name,
      icon: project.icon,
      description: project.description,
      visibility: project.visibility,
      orderIndex: project.orderIndex,
      archived: project.isArchived,
    },
  });

  const handleSettingsOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setOpenPageModal(false);
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await editProject({
        projectId: project.id,
        request: {
          name: data.name,
          icon: data.icon,
          description: data.description,
          visibility: data.visibility as ProjectVisibility,
          orderIndex: data.orderIndex,
          isArchived: data.archived,
        },
      });
      toast.success('Project updated successfully');
      form.reset({
        name: response.name,
        icon: response.icon,
        description: response.description,
        visibility: response.visibility,
        orderIndex: response.orderIndex,
        archived: response.isArchived,
      });
      handleSettingsOpenChange(false);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      applyRequestFailureToForm(form, error);
    }
  };

  const workspaceRole = useGetWorkspaceRole(project.workspaceId);
  const isAdmin = isWorkspaceAdmin(workspaceRole);

  const handleDeleteProject = async () => {
    try {
      await deleteProject(project.id);
      toast.success('Project deleted successfully');
      handleSettingsOpenChange(false);
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

  const handleSettingsSubmit = form.handleSubmit(onSubmit);

  return (
    <Modal
      title="Project settings"
      description="You can change the project settings."
      trigger={trigger}
      contentClassName="max-w-[700px]!"
      onOpenAutoFocus={(event) => event.preventDefault()}
      triggerClassName="right-px! top-px!"
      footerButtons={
        <>
          <DialogClose asChild>
            <Button
              variant="outline"
              type="button"
              onClick={() => handleSettingsOpenChange(false)}
            >
              Cancel
            </Button>
          </DialogClose>
          <Button
            isLoading={isPending}
            disabled={!form.formState.isDirty}
            type="submit"
            form={formId}
          >
            Update
          </Button>
        </>
      }
      open={open}
      setOpen={handleSettingsOpenChange}
    >
      <Form {...form}>
        <form
          id={formId}
          onSubmit={(event) => {
            if (event.target !== event.currentTarget) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }

            void handleSettingsSubmit(event);
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

          <FormField
            control={form.control}
            name="visibility"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Visibility</FormLabel>
                <FormControl>
                  <Select
                    disabled={isPending || !isAdmin}
                    value={field.value || ''}
                    onValueChange={(value) => field.onChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select project visibility" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value={ProjectVisibility.WORKSPACE}>
                        Workspace
                      </SelectItem>
                      <SelectItem value={ProjectVisibility.PRIVATE}>
                        Private
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
            name="orderIndex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project Order Index</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Enter project order index"
                    disabled={isPending || !isAdmin}
                    value={field.value}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value === '' ? 0 : parseInt(e.target.value),
                      )
                    }
                  />
                </FormControl>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="archived"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="archived">Project Archived</FormLabel>
                <FormControl>
                  <Switch
                    id="archived"
                    disabled={isPending || !isAdmin}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />

          <SettingsProjectMembersSection
            projectId={project.id}
            workspaceId={project.workspaceId}
            isAdmin={isAdmin}
          />

          <Button
            variant="outline"
            className="w-full"
            type="button"
            disabled={isPending || !isAdmin || project.defaultPageId !== null}
            onClick={() => {
              setOpenPageModal(true);
            }}
          >
            Add default page <FileText />
          </Button>

          {isAdmin && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-[#af5d5d] bg-[#fff7f7] p-2 dark:border-[#fb5c5c] dark:bg-[#5f00001c]">
              <span className="pl-0.5 text-sm text-[#916767] dark:text-[#b5b5b5]">
                Delete project
              </span>
              <ConfirmationDialog
                title="Delete project"
                description="Are you sure you want to delete this project? This action cannot be undone."
                onConfirm={handleDeleteProject}
                trigger={
                  <Button
                    variant="destructive"
                    isLoading={isPending || isDeleting}
                    type="button"
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

      {project.id ? (
        <CreateProjectPageModal
          isOpen={openPageModal}
          setIsOpen={setOpenPageModal}
          projectId={project.id}
          projectRole={project.role}
          isDefaultPage={true}
          parentPageId={null}
        />
      ) : null}
    </Modal>
  );
}
