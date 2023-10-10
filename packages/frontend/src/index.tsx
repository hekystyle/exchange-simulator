import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App.jsx';
import { queryClient } from './query-client.js';

const element = document.getElementById('root');
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- element is not null
const root = ReactDOM.createRoot(element!);

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
