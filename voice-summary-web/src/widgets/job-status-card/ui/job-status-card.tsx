import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useJobStatus, JobStatus } from '@/entities/job';
import { Card, CardContent, ProgressBar, Spinner } from '@/shared/ui';
import { cn, formatDate } from '@/shared/lib';
import { CheckCircle, XCircle, Clock, Loader, FileAudio } from 'lucide-react';

interface JobStatusCardProps {
  jobId: string;
  redirectOnComplete?: boolean;
}

const statusMessages: Record<JobStatus, { message: string; detail: string }> = {
  [JobStatus.QUEUED]: {
    message: 'Queued',
    detail: 'Your audio is waiting in the queue...',
  },
  [JobStatus.PREPROCESSING]: {
    message: 'Preprocessing',
    detail: 'Preparing your audio for transcription...',
  },
  [JobStatus.TRANSCRIBING]: {
    message: 'Transcribing',
    detail: 'Converting speech to text... This may take a few minutes.',
  },
  [JobStatus.POSTPROCESSING]: {
    message: 'Post-processing',
    detail: 'Cleaning up and formatting the transcript...',
  },
  [JobStatus.SUMMARIZING]: {
    message: 'Summarizing',
    detail: 'Generating summary, key points, and quiz...',
  },
  [JobStatus.DONE]: {
    message: 'Complete',
    detail: 'Your audio has been processed successfully!',
  },
  [JobStatus.FAILED]: {
    message: 'Failed',
    detail: 'Something went wrong. Please try again.',
  },
};

export const JobStatusCard = ({ jobId, redirectOnComplete = true }: JobStatusCardProps) => {
  const navigate = useNavigate();
  const { data: job, isLoading, error } = useJobStatus(jobId);

  // Redirect to study room when done
  useEffect(() => {
    if (redirectOnComplete && job?.status === JobStatus.DONE) {
      navigate(`/study-room/${jobId}`);
    }
  }, [job?.status, jobId, navigate, redirectOnComplete]);

  if (isLoading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 flex flex-col items-center">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading job status...</p>
        </CardContent>
      </Card>
    );
  }

  if (error || !job) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 text-red-600 mb-4">
            <XCircle className="h-8 w-8" />
            <h2 className="text-xl font-bold">Error</h2>
          </div>
          <p className="text-gray-600">
            Failed to load job status. The job may not exist or there was a network error.
          </p>
        </CardContent>
      </Card>
    );
  }

  const statusInfo = statusMessages[job.status];
  const isProcessing = job.status !== JobStatus.DONE && job.status !== JobStatus.FAILED;
  const isDone = job.status === JobStatus.DONE;
  const isFailed = job.status === JobStatus.FAILED;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div
            className={cn(
              'p-3 rounded-full',
              isProcessing && 'bg-blue-100',
              isDone && 'bg-green-100',
              isFailed && 'bg-red-100'
            )}
          >
            {isProcessing && <Loader className="h-8 w-8 text-blue-600 animate-spin" />}
            {isDone && <CheckCircle className="h-8 w-8 text-green-600" />}
            {isFailed && <XCircle className="h-8 w-8 text-red-600" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{statusInfo.message}</h2>
            <p className="text-sm text-gray-500">
              {job.filename || `Job ${job.job_id.slice(0, 8)}`}
            </p>
          </div>
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">{statusInfo.detail}</span>
              <span className="font-medium text-blue-600">{job.progress}%</span>
            </div>
            <ProgressBar current={job.progress} total={100} />
          </div>
        )}

        {/* Success message */}
        {isDone && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg mb-6">
            <p className="text-green-700">{statusInfo.detail}</p>
            <p className="text-sm text-green-600 mt-2">Redirecting to study room...</p>
          </div>
        )}

        {/* Error message */}
        {isFailed && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-red-700">{job.error || statusInfo.detail}</p>
          </div>
        )}

        {/* Job details */}
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <FileAudio className="h-4 w-4" />
            <span>Audio Processing</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Started {formatDate(job.created_at)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
