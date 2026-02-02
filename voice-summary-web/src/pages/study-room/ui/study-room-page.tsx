import { useParams, Link } from 'react-router-dom';
import { useJobResult } from '@/entities/job';
import { StudyBoard } from '@/widgets/study-board';
import { Spinner, Button } from '@/shared/ui';
import { ArrowLeft, AlertCircle } from 'lucide-react';

export const StudyRoomPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { data: result, isLoading, error } = useJobResult(jobId!);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading study materials...</p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <div className="text-center">
          <div className="inline-flex p-4 bg-red-100 rounded-full mb-4">
            <AlertCircle className="h-12 w-12 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Failed to Load Study Materials
          </h1>
          <p className="text-gray-600 mb-6">
            {error instanceof Error
              ? error.message
              : 'The study materials could not be loaded. Please try again.'}
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <StudyBoard transcript={result.transcript} summary={result.summary} />
      </div>
    </div>
  );
};;
