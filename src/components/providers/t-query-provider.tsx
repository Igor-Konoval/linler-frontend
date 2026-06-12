import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { type JSX, type PropsWithChildren } from 'react';
import {
  environmentManager,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';

let sharedClient: QueryClient | undefined;

function createClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: false,
        refetchOnWindowFocus: false,
      },
    },
  });
}

function resolveClient(): QueryClient {
  const isServerSide = environmentManager.isServer();

  if (isServerSide) {
    return createClient();
  }

  if (!sharedClient) {
    sharedClient = createClient();
  }

  return sharedClient;
}

export function TQueryProvider({ children }: PropsWithChildren): JSX.Element {
  const client = resolveClient();

  const shouldShowDevtools = process.env.NODE_ENV === 'development';

  return (
    <QueryClientProvider client={client}>
      {children}
      {shouldShowDevtools ? <ReactQueryDevtools initialIsOpen={false} /> : null}
    </QueryClientProvider>
  );
}
