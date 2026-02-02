# Copilot Instructions: LASS Frontend - Study-Optimized Audio Learning Platform

## Project Overview
Build a **Study-Centric Web Interface** for students and seminar attendees to review long-form audio content (lectures, seminars, meetings). The app provides synchronized audio playback with transcripts, structured summaries, and interactive quizzes.

**Target Users**: Students, seminar attendees, lifelong learners
**Tech Stack**: React 18+, TypeScript 5+, Vite, Tailwind CSS, TanStack Query, Zustand
**Architecture**: Feature-Sliced Design (FSD)

---

## 🎯 Priority Levels

### Must Have (MVP)
- File upload with drag-and-drop + progress tracking
- Job status polling with real-time progress UI
- Audio player with transcript sync (click-to-seek)
- Split-view layout (audio/transcript + summary)
- Mobile-responsive design (stack layout)
- Basic quiz taking interface

### Should Have (Phase 2)
- Audio playback speed control (0.5x - 2x)
- Transcript search with jump-to functionality
- Export summary as PDF/Markdown
- Keyboard shortcuts (Space: play/pause, Arrow keys: skip)
- Dark mode support
- Local storage for playback position resume

### Nice to Have (Future)
- Multi-tab study sessions (compare multiple lectures)
- Collaborative annotations
- Spaced repetition quiz system
- Voice-based navigation

---

## 📋 Code Review Checklist

Before committing, verify:
- [ ] All components have proper TypeScript types (no `any`)
- [ ] FSD layer rules followed (no upward imports)
- [ ] Loading states handled (`isLoading`, `isPending`)
- [ ] Error boundaries implemented for critical features
- [ ] Accessibility: keyboard navigation, ARIA labels
- [ ] Mobile-first Tailwind classes used
- [ ] No prop drilling (use composition or context)
- [ ] TanStack Query used for all server state
- [ ] Images have `alt` text, buttons have descriptive labels

---

## 🏗️ Feature-Sliced Design (FSD) Architecture

### Layer Hierarchy & Rules
**Dependency Rule**: Layers can **ONLY** import from layers below them.
```
app → pages → widgets → features → entities → shared
```

### 1. `src/app/` - Application Layer
Global configuration, providers, and entry point.

```
app/
├── providers/
│   ├── query-provider.tsx      # TanStack Query setup
│   ├── router-provider.tsx     # React Router configuration
│   └── theme-provider.tsx      # Dark mode context
├── styles/
│   └── global.css              # Tailwind directives + custom globals
├── router/
│   └── index.tsx               # Route definitions
└── App.tsx                     # Root component
```

**Example: Query Provider**
```tsx
// app/providers/query-provider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const QueryProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
);
```

---

### 2. `src/pages/` - Page Layer
Route-level composition of widgets. No business logic.

```
pages/
├── home/
│   ├── ui/
│   │   └── home-page.tsx       # Landing + recent jobs
│   └── index.ts
├── upload/
│   ├── ui/
│   │   └── upload-page.tsx     # Upload interface + job creation
│   └── index.ts
├── study-room/
│   ├── ui/
│   │   └── study-room-page.tsx # Main result viewer
│   └── index.ts
└── history/
    ├── ui/
    │   └── history-page.tsx    # Job history list
    └── index.ts
```

**Example: Study Room Page**
```tsx
// pages/study-room/ui/study-room-page.tsx
import { useParams } from 'react-router-dom';
import { AudioPlayerBar } from '@/widgets/audio-player-bar';
import { StudyBoard } from '@/widgets/study-board';
import { useJobResult } from '@/entities/job';

export const StudyRoomPage = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const { data: result, isLoading, error } = useJobResult(jobId!);

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error} />;
  if (!result) return <NotFoundScreen />;

  return (
    <div className="flex flex-col h-screen">
      {/* Fixed audio player at bottom */}
      <AudioPlayerBar audioUrl={result.audioUrl} />
      
      {/* Main content area */}
      <div className="flex-1 overflow-hidden">
        <StudyBoard 
          transcript={result.transcript}
          summary={result.summary}
        />
      </div>
    </div>
  );
};
```

---

### 3. `src/widgets/` - Widget Layer
Large autonomous UI blocks combining features and entities.

```
widgets/
├── audio-player-bar/
│   ├── ui/
│   │   ├── audio-player-bar.tsx
│   │   └── playback-controls.tsx
│   ├── model/
│   │   └── use-audio-player.ts  # Zustand store
│   └── index.ts
├── study-board/
│   ├── ui/
│   │   ├── study-board.tsx      # Tab container
│   │   ├── transcript-panel.tsx
│   │   └── summary-panel.tsx
│   └── index.ts
├── job-status-card/
│   ├── ui/
│   │   └── job-status-card.tsx  # Polling progress display
│   └── index.ts
└── header/
    ├── ui/
    │   └── header.tsx
    └── index.ts
```

**Example: Audio Player Widget**
```tsx
// widgets/audio-player-bar/ui/audio-player-bar.tsx
import { useRef, useEffect } from 'react';
import { useAudioPlayer } from '../model/use-audio-player';
import { PlaybackControls } from './playback-controls';
import { ProgressBar } from '@/shared/ui/progress-bar';

interface AudioPlayerBarProps {
  audioUrl: string;
}

export const AudioPlayerBar = ({ audioUrl }: AudioPlayerBarProps) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { 
    isPlaying, 
    currentTime, 
    duration,
    playbackRate,
    setIsPlaying, 
    setCurrentTime,
    setDuration,
    seekTo 
  } = useAudioPlayer();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [setCurrentTime, setDuration]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
      <audio ref={audioRef} src={audioUrl} />
      
      <ProgressBar 
        current={currentTime} 
        total={duration}
        onSeek={seekTo}
      />
      
      <PlaybackControls
        isPlaying={isPlaying}
        onPlayPause={() => {
          if (isPlaying) {
            audioRef.current?.pause();
          } else {
            audioRef.current?.play();
          }
          setIsPlaying(!isPlaying);
        }}
      />
    </div>
  );
};
```

**Zustand Store Example**
```tsx
// widgets/audio-player-bar/model/use-audio-player.ts
import { create } from 'zustand';

interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setPlaybackRate: (rate: number) => void;
  seekTo: (time: number) => void;
}

export const useAudioPlayer = create<AudioPlayerState>((set) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  playbackRate: 1.0,
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration: duration }),
  setPlaybackRate: (rate) => set({ playbackRate: rate }),
  seekTo: (time) => set({ currentTime: time }),
}));
```

---

### 4. `src/features/` - Feature Layer
User interactions with business value. Contains action logic.

```
features/
├── upload-audio/
│   ├── ui/
│   │   ├── file-dropzone.tsx
│   │   └── upload-button.tsx
│   ├── model/
│   │   └── use-upload-audio.ts   # Upload mutation
│   └── index.ts
├── take-quiz/
│   ├── ui/
│   │   ├── quiz-card.tsx
│   │   └── answer-button.tsx
│   ├── model/
│   │   └── use-quiz-session.ts
│   └── index.ts
├── export-summary/
│   ├── ui/
│   │   └── export-button.tsx
│   ├── api/
│   │   └── export-api.ts
│   └── index.ts
└── highlight-keyword/
    ├── ui/
    │   └── keyword-highlighter.tsx
    └── index.ts
```

**Example: Upload Feature**
```tsx
// features/upload-audio/model/use-upload-audio.ts
import { useMutation } from '@tanstack/react-query';
import { uploadAudio } from '@/entities/job/api';
import { useNavigate } from 'react-router-dom';

export const useUploadAudio = () => {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: uploadAudio,
    onSuccess: (data) => {
      navigate(`/jobs/${data.job_id}/status`);
    },
    onError: (error) => {
      console.error('Upload failed:', error);
      // Handle error (toast notification, etc.)
    },
  });
};
```

```tsx
// features/upload-audio/ui/file-dropzone.tsx
import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: Record<string, string[]>;
  maxSize?: number;
}

export const FileDropzone = ({ 
  onFileSelect, 
  accept = { 'audio/*': ['.mp3', '.wav', '.m4a'] },
  maxSize = 500 * 1024 * 1024 // 500MB
}: FileDropzoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition',
        'hover:border-blue-500 hover:bg-blue-50',
        isDragActive && 'border-blue-500 bg-blue-50'
      )}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-4 text-sm text-gray-600">
        {isDragActive ? 'Drop the file here' : 'Drag & drop an audio file, or click to select'}
      </p>
      <p className="mt-2 text-xs text-gray-500">
        Supported formats: MP3, WAV, M4A (Max 500MB)
      </p>
      {fileRejections.length > 0 && (
        <p className="mt-2 text-sm text-red-500">
          File rejected: {fileRejections[0].errors[0].message}
        </p>
      )}
    </div>
  );
};
```

---

### 5. `src/entities/` - Entity Layer
Domain business logic and read-only data representations.

```
entities/
├── job/
│   ├── api/
│   │   ├── job-api.ts           # API functions
│   │   └── types.ts             # API response types
│   ├── model/
│   │   ├── types.ts             # Domain types
│   │   └── use-job-status.ts   # Polling hook
│   ├── ui/
│   │   └── job-card.tsx
│   └── index.ts
├── transcript/
│   ├── model/
│   │   └── types.ts
│   ├── ui/
│   │   ├── transcript-segment.tsx
│   │   └── transcript-list.tsx
│   └── index.ts
├── summary/
│   ├── model/
│   │   └── types.ts
│   ├── ui/
│   │   ├── summary-section.tsx
│   │   └── key-points-list.tsx
│   └── index.ts
└── quiz/
    ├── model/
    │   └── types.ts
    ├── ui/
    │   └── quiz-point-card.tsx
    └── index.ts
```

**Example: Job Entity**
```tsx
// entities/job/model/types.ts
export enum JobStatus {
  QUEUED = 'queued',
  PREPROCESSING = 'preprocessing',
  TRANSCRIBING = 'transcribing',
  POSTPROCESSING = 'postprocessing',
  SUMMARIZING = 'summarizing',
  DONE = 'done',
  FAILED = 'failed',
}

export interface Job {
  job_id: string;
  status: JobStatus;
  progress: number; // 0-100
  created_at: string;
  updated_at: string;
  error?: string;
}

export interface JobResult {
  transcript: TranscriptSegment[];
  summary: Summary;
}

export interface TranscriptSegment {
  id: string;
  text: string;
  start: number;  // seconds
  end: number;    // seconds
}

export interface Summary {
  tldr: string;
  outline: SectionSummary[];
  key_points: string[];
  action_items: string[];
  quiz_points: QuizPoint[];
}

export interface SectionSummary {
  title: string;
  timestamp: string;
  content: string;
}

export interface QuizPoint {
  question: string;
  concept: string;
  difficulty: 'easy' | 'medium' | 'hard';
}
```

```tsx
// entities/job/api/job-api.ts
import { apiClient } from '@/shared/api';
import { Job, JobResult } from '../model/types';

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

export const getJobResult = async (jobId: string): Promise<JobResult> => {
  const { data } = await apiClient.get<JobResult>(`/v1/jobs/${jobId}/result`);
  return data;
};
```

```tsx
// entities/job/model/use-job-status.ts
import { useQuery } from '@tanstack/react-query';
import { getJobStatus } from '../api/job-api';
import { JobStatus } from './types';

export const useJobStatus = (jobId: string) => {
  return useQuery({
    queryKey: ['job', jobId, 'status'],
    queryFn: () => getJobStatus(jobId),
    // Poll every 2 seconds while processing
    refetchInterval: (data) => {
      if (!data) return false;
      const processingStates = [
        JobStatus.QUEUED,
        JobStatus.PREPROCESSING,
        JobStatus.TRANSCRIBING,
        JobStatus.POSTPROCESSING,
        JobStatus.SUMMARIZING,
      ];
      return processingStates.includes(data.status) ? 2000 : false;
    },
    // Keep previous data while refetching
    placeholderData: (previousData) => previousData,
  });
};
```

**Example: Transcript Entity UI**
```tsx
// entities/transcript/ui/transcript-segment.tsx
import { memo } from 'react';
import { cn } from '@/shared/lib/utils';
import { TranscriptSegment as TranscriptSegmentType } from '@/entities/job';
import { useAudioPlayer } from '@/widgets/audio-player-bar';

interface TranscriptSegmentProps {
  segment: TranscriptSegmentType;
  isActive: boolean;
}

export const TranscriptSegment = memo(({ segment, isActive }: TranscriptSegmentProps) => {
  const { seekTo } = useAudioPlayer();

  return (
    <p
      onClick={() => seekTo(segment.start)}
      className={cn(
        'py-2 px-4 rounded cursor-pointer transition',
        'hover:bg-blue-50',
        isActive && 'bg-blue-100 font-medium'
      )}
    >
      <span className="text-xs text-gray-500 mr-2">
        {formatTimestamp(segment.start)}
      </span>
      {segment.text}
    </p>
  );
});

function formatTimestamp(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
```

---

### 6. `src/shared/` - Shared Layer
Reusable infrastructure with NO business logic.

```
shared/
├── api/
│   ├── client.ts               # Axios instance
│   └── error-handler.ts
├── ui/
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   ├── progress-bar.tsx
│   ├── spinner.tsx
│   └── tabs.tsx
├── lib/
│   ├── utils.ts                # cn, formatDate, etc.
│   └── constants.ts
└── hooks/
    ├── use-media-query.ts
    ├── use-debounce.ts
    └── use-local-storage.ts
```

**Example: API Client**
```tsx
// shared/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Example: Shared UI Component**
```tsx
// shared/ui/progress-bar.tsx
import { cn } from '@/shared/lib/utils';

interface ProgressBarProps {
  current: number;
  total: number;
  onSeek?: (time: number) => void;
  className?: string;
}

export const ProgressBar = ({ current, total, onSeek, className }: ProgressBarProps) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * total;
    onSeek(newTime);
  };

  return (
    <div
      className={cn('h-2 bg-gray-200 rounded-full cursor-pointer', className)}
      onClick={handleClick}
    >
      <div
        className="h-full bg-blue-600 rounded-full transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
```

---

## 🎨 UX/UI Design Principles (Study-Centric)

### 1. Readability-First Layout
```tsx
// ✅ GOOD: Optimal reading width
<div className="max-w-prose mx-auto leading-relaxed">
  <p className="text-base md:text-lg">{transcript}</p>
</div>

// ❌ BAD: Full-width text (hard to read)
<div className="w-full">
  <p>{transcript}</p>
</div>
```

**Typography Guidelines:**
- Body text: `text-base` (16px) on mobile, `text-lg` (18px) on desktop
- Line height: `leading-relaxed` (1.625) or `leading-loose` (2)
- Max width: `max-w-prose` (65ch) for paragraphs
- Headings: Clear hierarchy with `font-bold` and size contrast

### 2. Split View Pattern (Desktop)
```tsx
// study-board.tsx
<div className="grid md:grid-cols-2 gap-4 h-full">
  {/* Left: Transcript */}
  <div className="overflow-y-auto">
    <TranscriptPanel />
  </div>
  
  {/* Right: Summary */}
  <div className="overflow-y-auto">
    <SummaryPanel />
  </div>
</div>
```

**Mobile: Stack Layout**
```tsx
<Tabs defaultValue="transcript">
  <TabsList>
    <TabsTrigger value="transcript">Transcript</TabsTrigger>
    <TabsTrigger value="summary">Summary</TabsTrigger>
  </TabsList>
  <TabsContent value="transcript">
    <TranscriptPanel />
  </TabsContent>
  <TabsContent value="summary">
    <SummaryPanel />
  </TabsContent>
</Tabs>
```

### 3. Audio-Text Synchronization

**Auto-scroll to Active Segment:**
```tsx
// widgets/study-board/ui/transcript-panel.tsx
import { useEffect, useRef } from 'react';
import { useAudioPlayer } from '@/widgets/audio-player-bar';

export const TranscriptPanel = ({ segments }: { segments: TranscriptSegment[] }) => {
  const { currentTime } = useAudioPlayer();
  const activeSegmentRef = useRef<HTMLDivElement>(null);

  const activeIndex = segments.findIndex(
    (seg) => currentTime >= seg.start && currentTime < seg.end
  );

  useEffect(() => {
    if (activeSegmentRef.current) {
      activeSegmentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  return (
    <div className="space-y-2">
      {segments.map((segment, index) => (
        <div
          key={segment.id}
          ref={index === activeIndex ? activeSegmentRef : null}
        >
          <TranscriptSegment
            segment={segment}
            isActive={index === activeIndex}
          />
        </div>
      ))}
    </div>
  );
};
```

### 4. Polling UX (Job Status)

**Progress Indicator:**
```tsx
// widgets/job-status-card/ui/job-status-card.tsx
import { useJobStatus } from '@/entities/job';
import { Spinner } from '@/shared/ui/spinner';
import { ProgressBar } from '@/shared/ui/progress-bar';

export const JobStatusCard = ({ jobId }: { jobId: string }) => {
  const { data: job, isLoading } = useJobStatus(jobId);

  if (isLoading || !job) return <Spinner />;

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Processing Audio</h2>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-2">
          <span className="capitalize">{job.status.replace('_', ' ')}</span>
          <span>{job.progress}%</span>
        </div>
        <ProgressBar current={job.progress} total={100} />
      </div>

      {job.status === 'transcribing' && (
        <p className="text-sm text-gray-600">
          ⏳ Transcribing your audio... This may take a few minutes.
        </p>
      )}

      {job.status === 'failed' && (
        <div className="p-4 bg-red-50 border border-red-200 rounded">
          <p className="text-sm text-red-700">{job.error}</p>
        </div>
      )}
    </div>
  );
};
```

**Redirect on Completion:**
```tsx
// In the status page component
const { data: job } = useJobStatus(jobId);

useEffect(() => {
  if (job?.status === JobStatus.DONE) {
    navigate(`/study-room/${jobId}`);
  }
}, [job?.status, jobId, navigate]);
```

---

## 🚀 Common Patterns

### 1. Conditional Rendering (Loading/Error States)
```tsx
// ✅ GOOD: Explicit state handling
const { data, isLoading, error } = useJobResult(jobId);

if (isLoading) {
  return (
    <div className="flex items-center justify-center h-screen">
      <Spinner />
      <span className="ml-2">Loading result...</span>
    </div>
  );
}

if (error) {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded">
      <h3 className="font-bold text-red-700">Failed to load result</h3>
      <p className="text-sm text-red-600">{error.message}</p>
    </div>
  );
}

if (!data) {
  return <div>No data available</div>;
}

return <StudyBoard data={data} />;

// ❌ BAD: Unhandled states
const { data } = useJobResult(jobId);
return <StudyBoard data={data} />; // Crashes if data is undefined
```

### 2. Memoization (Performance Optimization)
```tsx
// ✅ GOOD: Memoize expensive components
import { memo } from 'react';

export const TranscriptSegment = memo(({ segment, isActive }: Props) => {
  // Component implementation
});

// Memoize callbacks passed to children
import { useCallback } from 'react';

const handleSeek = useCallback((time: number) => {
  seekTo(time);
}, [seekTo]);
```

### 3. Compound Component Pattern (Tabs)
```tsx
// shared/ui/tabs.tsx - Headless UI example
import * as TabsPrimitive from '@radix-ui/react-tabs';

export const Tabs = TabsPrimitive.Root;
export const TabsList = TabsPrimitive.List;
export const TabsTrigger = TabsPrimitive.Trigger;
export const TabsContent = TabsPrimitive.Content;

// Usage
<Tabs defaultValue="summary">
  <TabsList>
    <TabsTrigger value="summary">Summary</TabsTrigger>
    <TabsTrigger value="quiz">Quiz</TabsTrigger>
  </TabsList>
  <TabsContent value="summary">
    <SummaryView />
  </TabsContent>
  <TabsContent value="quiz">
    <QuizView />
  </TabsContent>
</Tabs>
```

### 4. Custom Hooks for Reusable Logic
```tsx
// shared/hooks/use-media-query.ts
import { useEffect, useState } from 'react';

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
};

// Usage
const isMobile = useMediaQuery('(max-width: 768px)');
```

---

## 🚫 Anti-Patterns (Avoid These!)

### ❌ Prop Drilling
```tsx
// BAD
<GrandParent data={data}>
  <Parent data={data}>
    <Child data={data}>
      <GrandChild data={data} />
    </Child>
  </Parent>
</GrandParent>

// GOOD: Use Context or Composition
const ResultContext = createContext<JobResult | null>(null);

<ResultContext.Provider value={data}>
  <GrandParent>
    {/* Any nested component can access data via useContext */}
  </GrandParent>
</ResultContext.Provider>
```

### ❌ Mixing Server and Client State
```tsx
// BAD: Storing server data in local state
const [jobs, setJobs] = useState([]);

useEffect(() => {
  fetchJobs().then(setJobs); // Stale data problem
}, []);

// GOOD: Use TanStack Query for server state
const { data: jobs } = useQuery({
  queryKey: ['jobs'],
  queryFn: fetchJobs,
});
```

### ❌ Ignoring Accessibility
```tsx
// BAD
<div onClick={handleClick}>Click me</div>

// GOOD
<button onClick={handleClick} aria-label="Upload audio file">
  Click me
</button>
```

### ❌ No Error Boundaries
```tsx
// BAD: One error crashes entire app
<App />

// GOOD: Wrap critical sections
<ErrorBoundary fallback={<ErrorScreen />}>
  <StudyRoomPage />
</ErrorBoundary>
```

---

## 🎯 Accessibility Checklist

- [ ] All interactive elements are keyboard accessible (Tab, Enter, Space)
- [ ] Focus indicators visible (`focus:ring-2 focus:ring-blue-500`)
- [ ] ARIA labels for icon-only buttons (`aria-label`)
- [ ] Semantic HTML (`<button>`, `<nav>`, `<main>`, `<article>`)
- [ ] Color contrast ratio ≥ 4.5:1 (WCAG AA)
- [ ] Screen reader tested with VoiceOver/NVDA
- [ ] Skip to main content link for keyboard users
- [ ] Form inputs have associated `<label>` elements

---

## 📱 Responsive Design Strategy

### Mobile-First Approach
```tsx
// ✅ GOOD: Mobile first, then desktop overrides
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-2xl md:text-3xl lg:text-4xl">Title</h1>
</div>

// ❌ BAD: Desktop-first (harder to maintain)
<div className="p-8 md:p-6 sm:p-4">
```

### Breakpoints (Tailwind)
- `sm`: 640px (small tablets)
- `md`: 768px (tablets)
- `lg`: 1024px (laptops)
- `xl`: 1280px (desktops)

### Layout Patterns
```tsx
// Mobile: Stack, Desktop: Split
<div className="flex flex-col md:flex-row gap-4">
  <aside className="md:w-1/3">Sidebar</aside>
  <main className="md:w-2/3">Content</main>
</div>

// Mobile: Full width, Desktop: Centered
<div className="w-full max-w-4xl mx-auto px-4">
  Content
</div>
```

---

## 🎨 Typography & Font Strategy

### Font Stack
```css
/* global.css */
@layer base {
  body {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  }
  
  /* Optional: Serif for reading-heavy sections */
  .font-serif {
    font-family: 'RIDI Batang', 'Noto Serif KR', Georgia, serif;
  }
}
```

### Usage
```tsx
// Sans-serif for UI elements (default)
<h1 className="text-2xl font-bold">Summary</h1>

// Serif for long-form reading (optional enhancement)
<article className="font-serif leading-loose">
  {summaryContent}
</article>
```

---

## ⌨️ Keyboard Shortcuts

### Implementation
```tsx
// shared/hooks/use-keyboard-shortcut.ts
import { useEffect } from 'react';

export const useKeyboardShortcut = (
  key: string,
  callback: () => void,
  modifiers?: { ctrl?: boolean; shift?: boolean; alt?: boolean }
) => {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === key &&
        (!modifiers?.ctrl || e.ctrlKey) &&
        (!modifiers?.shift || e.shiftKey) &&
        (!modifiers?.alt || e.altKey)
      ) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [key, callback, modifiers]);
};

// Usage in audio player
useKeyboardShortcut(' ', togglePlayPause); // Space
useKeyboardShortcut('ArrowRight', () => seekTo(currentTime + 5)); // +5s
useKeyboardShortcut('ArrowLeft', () => seekTo(currentTime - 5)); // -5s
```

---

## 🧪 Testing Guidelines

### Unit Tests (Vitest + React Testing Library)
```tsx
// entities/job/model/use-job-status.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useJobStatus } from './use-job-status';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

test('polls until job is done', async () => {
  const { result } = renderHook(() => useJobStatus('test-job-id'), {
    wrapper: createWrapper(),
  });

  await waitFor(() => {
    expect(result.current.data?.status).toBe('done');
  });
});
```

### Integration Tests
```tsx
// features/upload-audio/ui/file-dropzone.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FileDropzone } from './file-dropzone';

test('calls onFileSelect when file is dropped', async () => {
  const mockOnFileSelect = vi.fn();
  render(<FileDropzone onFileSelect={mockOnFileSelect} />);

  const file = new File(['audio content'], 'lecture.mp3', { type: 'audio/mp3' });
  const input = screen.getByLabelText(/drag & drop/i);

  await userEvent.upload(input, file);

  expect(mockOnFileSelect).toHaveBeenCalledWith(file);
});
```

### E2E Tests (Playwright)
```tsx
// e2e/upload-flow.spec.ts
import { test, expect } from '@playwright/test';

test('upload audio and view result', async ({ page }) => {
  await page.goto('/upload');

  // Upload file
  await page.setInputFiles('input[type="file"]', 'test-audio.mp3');
  await page.click('button:has-text("Upload")');

  // Wait for processing
  await expect(page.locator('text=Processing')).toBeVisible();
  await expect(page.locator('text=100%')).toBeVisible({ timeout: 60000 });

  // Check result page
  await expect(page).toHaveURL(/\/study-room\//);
  await expect(page.locator('text=Transcript')).toBeVisible();
});
```

---

## 🔐 Security Best Practices

### Input Validation
```tsx
// Validate file type client-side (also validate on server!)
const ALLOWED_TYPES = ['audio/mp3', 'audio/wav', 'audio/m4a'];
const MAX_SIZE = 500 * 1024 * 1024; // 500MB

const validateFile = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Invalid file type. Please upload MP3, WAV, or M4A.';
  }
  if (file.size > MAX_SIZE) {
    return 'File too large. Maximum size is 500MB.';
  }
  return null;
};
```

### XSS Prevention
```tsx
// ✅ GOOD: React automatically escapes
<p>{userContent}</p>

// ⚠️ DANGEROUS: Only if you trust the source
<div dangerouslySetInnerHTML={{ __html: sanitizedHTML }} />

// If you must render HTML, use DOMPurify
import DOMPurify from 'dompurify';
const clean = DOMPurify.sanitize(dirtyHTML);
```

### Environment Variables
```tsx
// .env.example
VITE_API_BASE_URL=http://localhost:8000
VITE_MAX_FILE_SIZE_MB=500

// Access in code
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

---

## 📊 Performance Optimization

### Code Splitting
```tsx
// Lazy load heavy pages
import { lazy, Suspense } from 'react';

const StudyRoomPage = lazy(() => import('@/pages/study-room'));

// In router
<Suspense fallback={<Spinner />}>
  <StudyRoomPage />
</Suspense>
```

### Image Optimization
```tsx
// Use modern formats with fallback
<picture>
  <source srcSet="image.webp" type="image/webp" />
  <img src="image.jpg" alt="Description" loading="lazy" />
</picture>
```

### Virtual Scrolling (for long transcripts)
```tsx
// Use react-window for thousands of segments
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={segments.length}
  itemSize={50}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <TranscriptSegment segment={segments[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## ✅ Definition of Done (Frontend)

A feature is complete when:

- [ ] **Functionality**: Feature works as specified in requirements
- [ ] **Responsive**: Tested on mobile (375px), tablet (768px), desktop (1280px)
- [ ] **Accessibility**: Passes keyboard navigation and screen reader tests
- [ ] **Error Handling**: Loading and error states are handled gracefully
- [ ] **TypeScript**: No `any` types, all props typed
- [ ] **FSD Compliance**: No upward layer imports
- [ ] **Testing**: Unit tests pass, critical paths covered
- [ ] **Performance**: No unnecessary re-renders (React DevTools Profiler checked)
- [ ] **Code Review**: Passes checklist at top of this document
- [ ] **User Tested**: At least one person has used the feature successfully

---

## 🚀 Quick Start for New Features

1. **Identify the layer**: Where does this belong? (Feature? Widget? Entity?)
2. **Define types**: Create types in `entities/{slice}/model/types.ts`
3. **Build UI components**: Start from shared/ui primitives
4. **Add business logic**: Hooks in `model/`, API calls in `api/`
5. **Compose in parent layer**: Widgets use Features, Pages use Widgets
6. **Handle states**: Loading, error, empty states
7. **Add accessibility**: Keyboard nav, ARIA labels
8. **Write tests**: At least one happy path test
9. **Test responsively**: Mobile and desktop layouts
10. **Document**: Add JSDoc for exported functions

---

## 📚 Additional Resources

- **FSD Documentation**: https://feature-sliced.design/
- **TanStack Query**: https://tanstack.com/query/latest
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/
- **React Testing Library**: https://testing-library.com/react
- **Accessibility (a11y)**: https://www.a11yproject.com/

---

**Last Updated**: 2024-01-30  
**Maintained By**: Frontend Team  
**Questions?**: Check FSD docs or ask in #frontend-help