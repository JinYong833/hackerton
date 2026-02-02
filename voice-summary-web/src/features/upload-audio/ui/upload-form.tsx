import { useState } from 'react';
import { FileDropzone } from './file-dropzone';
import { useUploadAudio } from '../model';
import { Button, Card, CardContent, CardHeader } from '@/shared/ui';
import { Upload, FileAudio } from 'lucide-react';

export const UploadForm = () => {
  const [file, setFile] = useState<File | null>(null);
  const { mutate: upload, isPending, error } = useUploadAudio();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) {
      upload(file);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileAudio className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Upload Audio</h2>
            <p className="text-sm text-gray-500">
              Upload a lecture, seminar, or meeting recording to get started.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FileDropzone onFileSelect={setFile} disabled={isPending} />

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                Upload failed: {error instanceof Error ? error.message : 'Unknown error'}
              </p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!file || isPending}
            isLoading={isPending}
          >
            <Upload className="h-5 w-5 mr-2" />
            {isPending ? 'Uploading...' : 'Upload & Process'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
