import { useQuery } from '@tanstack/react-query';
import * as ApiClient from './simulation-api-client.js';

export const useSimulationStatus = () => {
  return useQuery({
    queryKey: ['simulation'],
    queryFn: async ({ signal }) => await ApiClient.fetchSimulation(signal),
  });
};
