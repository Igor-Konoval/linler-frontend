import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { ERROR_MESSAGES } from '../constants/http.constants';
import {
  IMAGE_SIZE_LIMIT,
  VALID_IMAGE_TYPES,
} from '../constants/media.constants';
import { useDeleteAvatar } from '../hooks/user/use-delete-avatar';
import { useEditUserAccount } from '../hooks/user/use-edit-user-account';
import { useEditUserAvatar } from '../hooks/user/use-edit-user-avatar';
import { GET_USER_QUERY_KEY } from '../hooks/user/use-get-user';
import {
  GET_USER_ACCOUNT_QUERY_KEY,
  useGetUserAccount,
} from '../hooks/user/use-get-user-account';
import { GetUserResponse } from '../types/auth.types';
import { GetUserAccountResponse } from '../types/user.types';
import { isRequestFailure } from '../utils/request-failure.utils';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { Trash2Icon } from 'lucide-react';
import { SMALL_MOBILE_BREAKPOINT } from '../constants/base.constants';
import { useMediaQuery } from '../hooks/use-media-query';

interface EditAccountSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = z.object({
  username: z.string().min(2).max(100),
});

export function EditAccountSheet({
  open,
  onOpenChange,
}: EditAccountSheetProps) {
  const { data: userAccount, isPending } = useGetUserAccount();
  const { mutateAsync: editUserAccount, isPending: isEditingUserAccount } =
    useEditUserAccount();
  const { mutateAsync: editUserAvatar, isPending: isEditingUserAvatar } =
    useEditUserAvatar();
  const { mutateAsync: deleteAvatar, isPending: isDeletingAvatar } =
    useDeleteAvatar();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
    },
  });

  useEffect(() => {
    if (!userAccount) {
      return;
    }

    form.reset({
      username: userAccount.username,
    });
  }, [form, userAccount]);

  const [avatar, setAvatar] = useState<File | undefined>(undefined);
  const queryClient = useQueryClient();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (!VALID_IMAGE_TYPES.includes(file.type)) {
      toast.warning(ERROR_MESSAGES.ImageTypeNotSupported);
      e.currentTarget.value = '';
      return;
    }

    if (file.size > IMAGE_SIZE_LIMIT) {
      toast.warning(
        ERROR_MESSAGES.ImageSizeLimitExceeded +
          ': ' +
          IMAGE_SIZE_LIMIT / 1024 / 1024 +
          ' MB',
      );
      e.currentTarget.value = '';
      return;
    }

    setAvatar(file);
    e.currentTarget.value = '';
  };
  const imageUrl = useMemo(() => {
    return avatar
      ? URL.createObjectURL(avatar)
      : (userAccount?.avatarUrl ?? null);
  }, [avatar, userAccount?.avatarUrl]);

  const currentUsername = useWatch({
    control: form.control,
    name: 'username',
  });

  const isUsernameChanged =
    currentUsername.trim() !== (userAccount?.username ?? '');

  const hasChanges = Boolean(avatar) || isUsernameChanged;

  const handleSave = async (data: z.infer<typeof formSchema>) => {
    if (avatar) {
      const formData = new FormData();
      formData.append('avatar', avatar);

      try {
        const response = await editUserAvatar(formData);

        queryClient.setQueryData<GetUserAccountResponse>(
          [GET_USER_ACCOUNT_QUERY_KEY],
          response,
        );

        queryClient.setQueryData<GetUserResponse>([GET_USER_QUERY_KEY], {
          id: response.id,
          email: response.email,
          username: response.username,
          avatarUrl: response.avatarUrl,
        });

        setAvatar(undefined);
        toast.success('Avatar updated successfully');
      } catch (error) {
        if (isRequestFailure(error)) {
          toast.error(error.message);
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error(error, 'avatar update error');
          }
          toast.error(ERROR_MESSAGES.SomethingWentWrong);
        }
      }
    }

    if (data.username.trim() !== userAccount?.username) {
      try {
        const response = await editUserAccount({
          username: data.username.trim(),
        });

        queryClient.setQueryData<GetUserAccountResponse>(
          [GET_USER_ACCOUNT_QUERY_KEY],
          response,
        );

        queryClient.setQueryData<GetUserResponse>([GET_USER_QUERY_KEY], {
          id: response.id,
          email: response.email,
          username: response.username,
          avatarUrl: response.avatarUrl,
        });

        toast.success('Username updated successfully');
      } catch (error) {
        if (isRequestFailure(error)) {
          toast.error(error.message);
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error(error, 'username update error');
          }
          toast.error(ERROR_MESSAGES.SomethingWentWrong);
        }
      }
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      const response = await deleteAvatar();
      queryClient.setQueryData<GetUserAccountResponse>(
        [GET_USER_ACCOUNT_QUERY_KEY],
        response,
      );
      queryClient.setQueryData<GetUserResponse>([GET_USER_QUERY_KEY], {
        id: response.id,
        email: response.email,
        username: response.username,
        avatarUrl: response.avatarUrl,
      });
      setAvatar(undefined);
      toast.success('Avatar deleted successfully');
    } catch (error) {
      if (isRequestFailure(error)) {
        toast.error(error.message);
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.error(error, 'avatar delete error');
        }
        toast.error(ERROR_MESSAGES.SomethingWentWrong);
      }
    }
  };

  const isLoading =
    isPending ||
    isEditingUserAccount ||
    isEditingUserAvatar ||
    isDeletingAvatar;

  const isMobile = useMediaQuery(
    `(max-width: ${SMALL_MOBILE_BREAKPOINT - 1}px)`,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className={isMobile ? 'max-w-screen! w-screen!' : ''}
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <SheetHeader>
          <SheetTitle>Account</SheetTitle>
          <SheetDescription>
            Make changes to your account here. Click save when you&apos;re done.
          </SheetDescription>
        </SheetHeader>
        <div className="grid flex-1 auto-rows-min gap-6 px-4">
          <div className="grid gap-3">
            <Label htmlFor="avatar-upload">Avatar</Label>
            <div className="relative">
              {userAccount?.avatarUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="z-1 absolute right-3 top-3"
                  onClick={handleDeleteAvatar}
                  disabled={isDeletingAvatar || isLoading}
                >
                  <Trash2Icon
                    className="text-destructive size-4"
                    strokeWidth={3}
                  />
                </Button>
              )}
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt="Avatar"
                  onClick={() =>
                    document.getElementById('avatar-upload')?.click()
                  }
                  unoptimized
                  fill
                  className="relative! aspect-square cursor-pointer rounded-lg object-cover"
                />
              ) : (
                <div
                  className="aspect-square h-full w-full cursor-pointer rounded-lg bg-gray-200 object-cover"
                  onClick={() =>
                    document.getElementById('avatar-upload')?.click()
                  }
                />
              )}
            </div>

            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              disabled={isLoading}
              accept={VALID_IMAGE_TYPES.join(',')}
              onChange={handleFileChange}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="sheet-name">Email</Label>
            <Input
              id="sheet-name"
              disabled
              value={userAccount?.email ?? 'example@example.com'}
            />
          </div>
          <div className="grid gap-3">
            <Label htmlFor="sheet-username">Username</Label>
            <Input
              id="sheet-username"
              disabled={isPending}
              {...form.register('username')}
            />
          </div>
        </div>
        <SheetFooter>
          <Button
            disabled={isLoading || !form.formState.isValid || !hasChanges}
            isLoading={isLoading}
            onClick={form.handleSubmit(handleSave)}
          >
            Save changes
          </Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
