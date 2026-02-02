import { useQuery } from '@tanstack/react-query';
import { getJobStatus, getJobResult, getJobsList } from '../api/job-api';
import { JobStatus } from './types';
import { POLLING_INTERVAL } from '@/shared/lib';

const PROCESSING_STATES: JobStatus[] = [
  JobStatus.QUEUED,
  JobStatus.PREPROCESSING,
  JobStatus.TRANSCRIBING,
  JobStatus.POSTPROCESSING,
  JobStatus.SUMMARIZING,
];

export const useJobStatus = (jobId: string) => {
  return useQuery({
    queryKey: ['job', jobId, 'status'],
    queryFn: () => getJobStatus(jobId),
    enabled: !!jobId,
    // Poll while processing
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return false;
      return PROCESSING_STATES.includes(data.status) ? POLLING_INTERVAL : false;
    },
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData,
  });
};

export const useJobResult = (jobId: string) => {
  return useQuery({
    queryKey: ['job', jobId, 'result'],
    queryFn: () => getJobResult(jobId),
    enabled: !!jobId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });
};

export const useJobsList = () => {
  return useQuery({
    queryKey: ['jobs', 'list'],
    queryFn: getJobsList,
    staleTime: 1000 * 30, // 30 seconds
  });
};
