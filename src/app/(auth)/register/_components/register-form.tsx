'use client';

import { Button } from '@/src/components/ui/button';
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
import { ROUTES } from '@/src/constants/routes.constants';
import { useRegister } from '@/src/hooks/auth/use-register';
import { GET_USER_QUERY_KEY } from '@/src/hooks/user/use-get-user';
import { GetUserResponse } from '@/src/types/auth.types';
import { applyRequestFailureToForm } from '@/src/utils/form-error.utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const formSchema = z
  .object({
    username: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      username: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { isPending, mutateAsync } = useRegister();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const result = await mutateAsync({
        username: data.username,
        email: data.email,
        password: data.password,
      });

      queryClient.setQueryData<GetUserResponse>([GET_USER_QUERY_KEY], result);

      router.push(ROUTES.HOME);
    } catch (err) {
      applyRequestFailureToForm(form, err);
    }
  };

  return (
    <Form {...form}>
      <form
        className="max-w-175 w-full space-y-6"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <h1 className="text-[28px]">Create your account</h1>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sm:text-lg">Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  className="sm:text-base!"
                  disabled={isPending}
                  autoComplete="email"
                  placeholder="email"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-700" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sm:text-lg">Username</FormLabel>
              <FormControl>
                <Input
                  className="sm:text-base!"
                  disabled={isPending}
                  placeholder="username"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-700" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sm:text-lg">Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    disabled={isPending}
                    placeholder="password"
                    className="sm:text-base! pr-9"
                    {...field}
                  />
                  <Button
                    onClick={() => setShowPassword((prev) => !prev)}
                    variant="ghost"
                    disabled={isPending}
                    type="button"
                    className="absolute right-0"
                  >
                    {showPassword ? <Eye /> : <EyeOff />}
                  </Button>
                </div>
              </FormControl>
              <FormMessage className="text-red-700" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="sm:text-lg">Confirm password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    disabled={isPending}
                    placeholder="confirm password"
                    className="sm:text-base! pr-9"
                    {...field}
                  />
                  <Button
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    disabled={isPending}
                    variant="ghost"
                    type="button"
                    className="absolute right-0"
                  >
                    {showConfirmPassword ? <Eye /> : <EyeOff />}
                  </Button>
                </div>
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

        <Button
          variant="outline"
          className="w-full p-5 text-base sm:text-lg"
          type="submit"
          isLoading={isPending}
        >
          {isPending ? 'Creating your account...' : 'Create account'}
        </Button>
        <Button
          asChild
          disabled={isPending}
          variant="primary"
          className="w-full p-5 text-base sm:text-lg"
        >
          <Link href={ROUTES.LOGIN}>Login</Link>
        </Button>
      </form>
    </Form>
  );
};
