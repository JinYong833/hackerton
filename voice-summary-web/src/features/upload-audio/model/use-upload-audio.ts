import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { uploadAudio } from '@/entities/job';

export const useUploadAudio = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadAudio,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['jobs', 'list'] });
      navigate(`/jobs/${data.job_id}/status`);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
    },
  });
};
