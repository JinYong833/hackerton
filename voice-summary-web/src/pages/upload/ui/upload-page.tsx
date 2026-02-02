import { UploadForm } from '@/features/upload-audio';

export const UploadPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Audio</h1>
        <p className="text-gray-600">
          Upload your lecture, seminar, or meeting recording to get started.
        </p>
      </div>
      <UploadForm />
    </div>
  );
};
