import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { cn, formatFileSize, MAX_FILE_SIZE_BYTES, ALLOWED_AUDIO_EXTENSIONS } from '@/shared/lib';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  maxSize?: number;
  disabled?: boolean;
}

export const FileDropzone = ({
  onFileSelect,
  maxSize = MAX_FILE_SIZE_BYTES,
  disabled = false,
}: FileDropzoneProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        setSelectedFile(acceptedFiles[0]);
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      accept: {
        'audio/*': ALLOWED_AUDIO_EXTENSIONS,
      },
      maxSize,
      multiple: false,
      disabled,
    });

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-12 text-center transition-all',
          'cursor-pointer',
          isDragActive && 'border-blue-500 bg-blue-50',
          !isDragActive && !disabled && 'border-gray-300 hover:border-blue-400 hover:bg-gray-50',
          disabled && 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
        )}
      >
        <input {...getInputProps()} aria-label="Upload audio file" />

        {selectedFile ? (
          <div className="flex flex-col items-center">
            <div className="p-3 bg-blue-100 rounded-full mb-4">
              <File className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900 mb-1">
              {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500 mb-4">
              {formatFileSize(selectedFile.size)}
            </p>
            <button
              type="button"
              onClick={clearFile}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4" />
              Remove file
            </button>
          </div>
        ) : (
          <>
            <div className="mx-auto p-3 bg-gray-100 rounded-full w-fit mb-4">
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {isDragActive
                ? 'Drop the file here'
                : 'Drag & drop an audio file, or click to select'}
            </p>
            <p className="text-xs text-gray-500">
              Supported formats: MP3, WAV, M4A (Max{' '}
              {Math.round(maxSize / 1024 / 1024)}MB)
            </p>
          </>
        )}
      </div>

      {fileRejections.length > 0 && (
        <p className="mt-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          {fileRejections[0].errors[0].message}
        </p>
      )}
    </div>
  );
};
