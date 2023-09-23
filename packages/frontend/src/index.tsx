import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { notification } from 'antd';
import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Router } from 'react-router-dom';
import { App } from './App.jsx';

const element = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- element is not null
const root = ReactDOM.createRoot(element!);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      cacheTime: 0,
    },
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      const { errorMessage } = query.meta ?? {};
      if (typeof errorMessage === 'string' || React.isValidElement(errorMessage)) {
        notification.error({
          message: errorMessage,
          description: error instanceof Error ? error.message : undefined,
        });
      }
    },
  }),
});

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
