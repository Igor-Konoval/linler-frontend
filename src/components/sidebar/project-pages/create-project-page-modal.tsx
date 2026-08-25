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
import { ProjectMemberRole } from '@/src/constants/workspaces.constants';
import { useCreateProjectPage } from '@/src/hooks/page/use-create-project-page';
import { useSetDefaultPage } from '@/src/hooks/projects/use-set-default-page';
import { applyRequestFailureToForm } from '@/src/utils/form-error.utils';
import { canUserInteractPage } from '@/src/utils/workspaces.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

const formSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { message: 'Title must be at least 1 character or longer' })
    .max(255, { message: 'Title must be less than 255 characters' }),
  icon: z
    .string()
    .trim()
    .refine((value) => !value || [...value].length === 1, {
      message: 'Icon must be a single emoji or symbol.',
    })
    .nullable(),
  parentPageId: z.string().nullable(),
});

export function CreateProjectPageModal({
  trigger,
  triggerClassName,
  projectRole,
  parentPageId,
  projectId,
  isDefaultPage,
  setIsOpen,
  isOpen,
}: {
  trigger?: React.ReactNode;
  triggerClassName?: string;
  projectId: string;
  parentPageId?: string | null;
  projectRole: ProjectMemberRole;
  isDefaultPage?: boolean;
  setIsOpen?: (open: boolean) => void;
  isOpen?: boolean;
}) {
  const isControlled = typeof isOpen === 'boolean';
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = isControlled ? isOpen : uncontrolledOpen;

  const setOpen = (nextOpen: boolean) => {
    if (!isControlled) {
      setUncontrolledOpen(nextOpen);
    }
    setIsOpen?.(nextOpen);
  };

  const { mutateAsync: createProjectPage, isPending } = useCreateProjectPage();
  const { mutateAsync: setDefaultPage, isPending: isSettingDefaultPage } =
    useSetDefaultPage();

  const isAbleToCreatePage = canUserInteractPage(projectRole);

  const getDefaultValues = () => ({
    title: '',
    icon: '📝' as string | null,
    parentPageId: parentPageId ?? null,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: getDefaultValues(),
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!isAbleToCreatePage) {
      toast.error('You do not have permission to create pages.');
      return;
    }

    try {
      const response = await createProjectPage({
        projectId,
        request: {
          title: data.title,
          icon: data.icon,
          parentPageId: data.parentPageId,
        },
      });
      if (isDefaultPage) {
        await setDefaultPage({
          projectId,
          request: {
            pageId: response.id,
          },
        });
      }
      toast.success(
        isDefaultPage
          ? 'Default page created successfully'
          : 'Page created successfully',
      );
      form.reset(getDefaultValues());
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
      form.reset(getDefaultValues());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when modal opens / parent changes
  }, [open, parentPageId]);

  const handleCreateSubmit = form.handleSubmit(onSubmit);

  return (
    <Modal
      title="Create page"
      description="You can create a new page."
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
            isLoading={isPending || isSettingDefaultPage}
            disabled={
              isPending ||
              isSettingDefaultPage ||
              !isAbleToCreatePage ||
              !form.formState.isDirty
            }
            form="create-project-page-form"
            type="button"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void handleCreateSubmit();
            }}
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
          id="create-project-page-form"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void handleCreateSubmit(event);
          }}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Page Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter page name"
                    disabled={
                      isPending || isSettingDefaultPage || !isAbleToCreatePage
                    }
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
                    disabled={
                      isPending || isSettingDefaultPage || !isAbleToCreatePage
                    }
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
