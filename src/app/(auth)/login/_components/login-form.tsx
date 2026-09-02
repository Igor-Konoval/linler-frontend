'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/src/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormRootMessage,
} from '@/src/components/ui/form';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/src/constants/routes.constants';
import { applyRequestFailureToForm } from '@/src/utils/form-error.utils';
import { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { GET_USER_QUERY_KEY } from '@/src/hooks/user/use-get-user';
import { GetUserResponse } from '@/src/types/auth.types';
import { useLogin } from '@/src/hooks/auth/use-login';
import Link from 'next/link';

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { isPending, mutateAsync } = useLogin();

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      const result = await mutateAsync({
        email: data.email,
        password: data.password,
      });

      queryClient.clear();
      queryClient.setQueryData<GetUserResponse>([GET_USER_QUERY_KEY], result);

      router.replace(ROUTES.HOME);
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
        <h1 className="text-[28px]">Login to your account</h1>
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
          {isPending ? 'Logging in...' : 'Login'}
        </Button>
        <Button
          asChild
          variant="primary"
          disabled={isPending}
          type="button"
          className="w-full p-5 text-base sm:text-lg"
        >
          <Link href={ROUTES.REGISTER}>Sign up</Link>
        </Button>
      </form>
    </Form>
  );
};
