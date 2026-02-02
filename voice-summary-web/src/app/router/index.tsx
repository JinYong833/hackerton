import { Routes, Route } from 'react-router-dom';
import { HomePage } from '@/pages/home';
import { UploadPage } from '@/pages/upload';
import { JobStatusPage } from '@/pages/job-status';
import { StudyRoomPage } from '@/pages/study-room';
import { HistoryPage } from '@/pages/history';

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/jobs/:jobId/status" element={<JobStatusPage />} />
      <Route path="/study-room/:jobId" element={<StudyRoomPage />} />
      <Route path="/history" element={<HistoryPage />} />
    </Routes>
  );
};
