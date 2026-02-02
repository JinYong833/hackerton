import { useParams } from 'react-router-dom';
import { JobStatusCard } from '@/widgets/job-status-card';

export const JobStatusPage = () => {
  const { jobId } = useParams<{ jobId: string }>();

  if (!jobId) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <div className="text-center text-red-600">
          <h1 className="text-2xl font-bold">Invalid Job</h1>
          <p>Job ID is missing from the URL.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Processing Audio</h1>
        <p className="text-gray-600">
          Please wait while we process your audio file.
        </p>
      </div>
      <JobStatusCard jobId={jobId} redirectOnComplete />
    </div>
  );
};
