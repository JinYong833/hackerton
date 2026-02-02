import { formatDate } from '@/shared/lib';
import { cn } from '@/shared/lib';
import { Card, CardContent, ProgressBar } from '@/shared/ui';
import type { Job } from '../model/types';
import { JobStatus } from '../model/types';
import { FileAudio, Clock, CheckCircle, XCircle, Loader } from 'lucide-react';

interface JobCardProps {
  job: Job;
  onClick?: () => void;
}

const statusConfig: Record<
  JobStatus,
  { label: string; color: string; icon: typeof Loader }
> = {
  [JobStatus.QUEUED]: { label: 'Queued', color: 'text-gray-500', icon: Clock },
  [JobStatus.PREPROCESSING]: {
    label: 'Preprocessing',
    color: 'text-blue-500',
    icon: Loader,
  },
  [JobStatus.TRANSCRIBING]: {
    label: 'Transcribing',
    color: 'text-blue-500',
    icon: Loader,
  },
  [JobStatus.POSTPROCESSING]: {
    label: 'Post-processing',
    color: 'text-blue-500',
    icon: Loader,
  },
  [JobStatus.SUMMARIZING]: {
    label: 'Summarizing',
    color: 'text-blue-500',
    icon: Loader,
  },
  [JobStatus.DONE]: { label: 'Completed', color: 'text-green-500', icon: CheckCircle },
  [JobStatus.FAILED]: { label: 'Failed', color: 'text-red-500', icon: XCircle },
};

export const JobCard = ({ job, onClick }: JobCardProps) => {
  const config = statusConfig[job.status];
  const StatusIcon = config.icon;
  const isProcessing = job.status !== JobStatus.DONE && job.status !== JobStatus.FAILED;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-shadow hover:shadow-md',
        onClick && 'hover:border-blue-300'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileAudio className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900 truncate">
                {job.filename || `Job ${job.job_id.slice(0, 8)}`}
              </p>
              <p className="text-sm text-gray-500">{formatDate(job.created_at)}</p>
            </div>
          </div>
          <div className={cn('flex items-center gap-1.5', config.color)}>
            <StatusIcon
              className={cn('h-4 w-4', isProcessing && 'animate-spin')}
            />
            <span className="text-sm font-medium">{config.label}</span>
          </div>
        </div>

        {isProcessing && (
          <div className="mt-4">
            <ProgressBar current={job.progress} total={100} />
            <p className="text-xs text-gray-500 mt-1 text-right">{job.progress}%</p>
          </div>
        )}

        {job.error && (
          <p className="mt-3 text-sm text-red-600 bg-red-50 p-2 rounded">
            {job.error}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
