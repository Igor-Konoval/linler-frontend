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
import { useDeletePage } from '@/src/hooks/page/use-delete-page';
import { useUpdatePage } from '@/src/hooks/page/use-update-page';
import type { PageResponse, PageSidebarItem } from '@/src/types/pages.types';
import type { ProjectResponse } from '@/src/types/projects.types';
import { applyRequestFailureToForm } from '@/src/utils/form-error.utils';
import { canUserInteractPage } from '@/src/utils/workspaces.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ConfirmationDialog } from '../../ui/confirmation-dialog';
import { Switch } from '../../ui/toggle';
import { useQueryClient } from '@tanstack/react-query';
import { GET_PROJECT_PAGE_QUERY_KEY } from '@/src/hooks/page/use-get-project-page';

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title must be at least 1 characters or longer' })
    .max(255, { message: 'Title must be less than 255 characters' }),
  icon: z
    .string()
    .trim()
    .refine((value) => !value || [...(value || '')].length === 1, {
      message: 'Icon must be a single emoji or symbol.',
    })
    .nullable(),
  orderIndex: z.number().min(0, { message: 'Order index must be at least 0' }),
  isArchived: z.boolean().default(false),
});

export function SettingsPageModal({
  trigger,
  page,
  project,
}: {
  trigger: React.ReactNode;
  page: PageSidebarItem;
  project: ProjectResponse;
}) {
  const [open, setOpen] = useState(false);
  const formId = useId();
  const { mutateAsync: updatePage, isPending } = useUpdatePage(project.id);
  const { mutateAsync: deletePage, isPending: isDeleting } = useDeletePage(
    project.id,
  );
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: page.title,
      icon: page.icon,
      orderIndex: page.orderIndex,
      isArchived: page.isArchived,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const response = await updatePage({
        pageId: page.id,
        request: {
          title: data.title,
          icon: data.icon,
          orderIndex: data.orderIndex,
          isArchived: data.isArchived,
        },
      });
      queryClient.setQueriesData<PageResponse>(
        { queryKey: [GET_PROJECT_PAGE_QUERY_KEY, page.id] },
        (oldData) => {
          if (!oldData) return oldData;

          if (oldData.id !== page.id) {
            return oldData;
          }

          return {
            ...oldData,
            title: data.title,
            icon: data.icon,
            orderIndex: data.orderIndex,
            isArchived: data.isArchived,
          };
        },
      );
      toast.success('Page updated successfully');
      form.reset({
        title: response.title,
        icon: response.icon,
        orderIndex: response.orderIndex,
        isArchived: response.isArchived,
      });
      setOpen(false);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error(error);
      }
      applyRequestFailureToForm(form, error);
    }
  };

  const isAbleToInteractPage = canUserInteractPage(project.role);

  const handleDeletePage = async () => {
    try {
      await deletePage(page.id);
      toast.success('Page deleted successfully');
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

  const handleSettingsSubmit = form.handleSubmit(onSubmit);

  return (
    <Modal
      title="Page settings"
      description="You can change the page settings."
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
              onClick={() => setOpen(false)}
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
      setOpen={setOpen}
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter title"
                    disabled={isPending || !isAbleToInteractPage}
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
                <FormLabel>Page Icon</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter page icon (e.g. 🚀)"
                    disabled={isPending || !isAbleToInteractPage || isDeleting}
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
            name="orderIndex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Page Order Index</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Enter page order index"
                    disabled={isPending || !isAbleToInteractPage || isDeleting}
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
            name="isArchived"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="is-archived">Page Archived</FormLabel>
                <FormControl>
                  <Switch
                    id="is-archived"
                    disabled={isPending || !isAbleToInteractPage || isDeleting}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormMessage className="text-red-700" />
              </FormItem>
            )}
          />

          <Button
            variant="outline"
            className="w-full"
            type="button"
            disabled={
              isPending ||
              !isAbleToInteractPage ||
              project.defaultPageId !== null ||
              isDeleting
            }
            onClick={() => {
              setOpen(true);
            }}
          >
            Set as default page <FileText />
          </Button>

          {isAbleToInteractPage && (
            <div className="flex items-center justify-between gap-2 rounded-xl border border-[#af5d5d] bg-[#fff7f7] p-2 dark:border-[#fb5c5c] dark:bg-[#5f00001c]">
              <span className="pl-0.5 text-sm text-[#916767] dark:text-[#b5b5b5]">
                Delete page
              </span>
              <ConfirmationDialog
                title="Delete page"
                description="Are you sure you want to delete this page? This action cannot be undone."
                onConfirm={handleDeletePage}
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
    </Modal>
  );
}
