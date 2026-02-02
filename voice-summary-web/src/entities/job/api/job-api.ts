import { apiClient } from '@/shared/api';
import type { Job, JobResult, ApiJobResult, ApiSegment, TranscriptSegment, QuizPoint } from '../model/types';

export const uploadAudio = async (file: File): Promise<Job> => {
  const formData = new FormData();
  formData.append('audio_file', file);

  const { data } = await apiClient.post<Job>('/v1/jobs', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getJobStatus = async (jobId: string): Promise<Job> => {
  const { data } = await apiClient.get<Job>(`/v1/jobs/${jobId}`);
  return data;
};

/**
 * Transform API segments to frontend TranscriptSegment format.
 * Backend now provides accurate timestamps from audio transcription.
 */
function transformSegments(apiSegments: ApiSegment[]): TranscriptSegment[] {
  return apiSegments.map((segment, index) => ({
    id: `seg-${index}`,
    text: segment.text,
    start: segment.start,
    end: segment.end,
  }));
}

/**
 * Transform API quiz points to include IDs for frontend state management
 */
function transformQuizPoints(apiQuizPoints: ApiJobResult['summary']['quiz_points']): QuizPoint[] {
  return apiQuizPoints.map((qp, index) => ({
    id: `quiz-${index}`,
    question: qp.question,
    concept: qp.concept,
    difficulty: qp.difficulty,
  }));
}

/**
 * Transform API response to frontend JobResult format
 */
function transformJobResult(apiResult: ApiJobResult): JobResult {
  return {
    job_id: apiResult.job_id,
    // Use segments from backend with accurate timestamps
    transcript: transformSegments(apiResult.segments),
    rawTranscript: apiResult.transcript,
    summary: {
      tldr: apiResult.summary.tldr,
      outline: apiResult.summary.outline,
      key_points: apiResult.summary.key_points,
      action_items: apiResult.summary.action_items,
      quiz_points: transformQuizPoints(apiResult.summary.quiz_points),
    },
  };
}

export const getJobResult = async (jobId: string): Promise<JobResult> => {
  const { data } = await apiClient.get<ApiJobResult>(`/v1/jobs/${jobId}/result`);
  return transformJobResult(data);
};

export const getJobsList = async (): Promise<Job[]> => {
  const { data } = await apiClient.get<Job[]>('/v1/jobs');
  return data;
};

export const deleteJob = async (jobId: string): Promise<void> => {
  await apiClient.delete(`/v1/jobs/${jobId}`);
};

export const retryJob = async (jobId: string): Promise<Job> => {
  const { data } = await apiClient.post<Job>(`/v1/jobs/${jobId}/retry`);
  return data;
};

export const healthCheck = async (): Promise<{ status: string; version: string; device: string }> => {
  const { data } = await apiClient.get('/health');
  return data;
};
