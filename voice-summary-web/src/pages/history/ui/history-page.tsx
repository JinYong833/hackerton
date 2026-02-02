import { Link } from 'react-router-dom';
import { useJobsList, JobCard, JobStatus } from '@/entities/job';
import { Spinner, Button } from '@/shared/ui';
import { Upload, FileAudio, AlertCircle } from 'lucide-react';

export const HistoryPage = () => {
  const { data: jobs, isLoading, error } = useJobsList();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="inline-flex p-4 bg-red-100 rounded-full mb-4">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Failed to Load History
        </h1>
        <p className="text-gray-600 mb-6">
          {error instanceof Error ? error.message : 'Please try again later.'}
        </p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center">
        <div className="inline-flex p-4 bg-gray-100 rounded-full mb-4">
          <FileAudio className="h-12 w-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No Sessions Yet</h1>
        <p className="text-gray-600 mb-6">
          Upload your first audio file to get started with AI-powered learning.
        </p>
        <Link to="/upload">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Audio
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">History</h1>
          <p className="text-gray-600 mt-1">
            {jobs.length} session{jobs.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/upload">
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            New Upload
          </Button>
        </Link>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Link
            key={job.job_id}
            to={
              job.status === JobStatus.DONE
                ? `/study-room/${job.job_id}`
                : `/jobs/${job.job_id}/status`
            }
          >
            <JobCard job={job} />
          </Link>
        ))}
      </div>
    </div>
  );
};
