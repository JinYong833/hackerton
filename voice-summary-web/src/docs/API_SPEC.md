# Long-Audio Summary Service - API Specification

**Version:** 1.0.0  
**Base URL:** `http://localhost:8000`  
**Last Updated:** 2026-01-30

---

## Overview

This API provides audio transcription and summarization services. Upload audio files to create transcription jobs, poll for status, and retrieve structured summaries including key points, action items, and quiz points.

### Key Features
- Async job-based processing
- Progress tracking with polling
- Structured summary output (TL;DR, outline, key points, action items, quiz points)
- Idempotent uploads (same file returns existing job)

---

## Authentication

Currently no authentication required (development mode).

---

## Common Response Formats

### Error Response

All error responses follow this format:

```json
{
  "error": "ERROR_CODE",
  "message": "Human readable error message",
  "details": {}
}
```

### Timestamps

All timestamps are in ISO 8601 format with UTC timezone:
```
2026-01-30T10:30:00Z
```

---

## Endpoints

### 1. Create Transcription Job

Upload an audio file to start transcription.

**Endpoint:** `POST /v1/jobs`

**Content-Type:** `multipart/form-data`

#### Request

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `audio_file` | File | Yes | Audio file to transcribe |

**Supported Formats:** `.mp3`, `.wav`, `.m4a`, `.flac`, `.ogg`, `.webm`

**Max File Size:** 500MB

#### Response

**Status:** `201 Created`

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "created_at": "2026-01-30T10:30:00Z"
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `job_id` | string (UUID) | Unique job identifier |
| `status` | string | Initial job status (`queued` or `done` if reused) |
| `created_at` | string (ISO 8601) | Job creation timestamp |

#### Errors

| Status | Error | Description |
|--------|-------|-------------|
| 400 | VALIDATION_ERROR | Invalid file format or file too large |
| 500 | INTERNAL_ERROR | Server error |

#### Example (cURL)

```bash
curl -X POST "http://localhost:8000/v1/jobs" \
  -F "audio_file=@lecture.mp3"
```

#### Example (JavaScript/Fetch)

```javascript
const formData = new FormData();
formData.append('audio_file', file);

const response = await fetch('http://localhost:8000/v1/jobs', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data.job_id);
```

---

### 2. Get Job Status

Poll for job processing status and progress.

**Endpoint:** `GET /v1/jobs/{job_id}`

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `job_id` | string (UUID) | Job identifier from create response |

#### Response

**Status:** `200 OK`

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "transcribing",
  "progress": 45,
  "created_at": "2026-01-30T10:30:00Z",
  "updated_at": "2026-01-30T10:35:00Z",
  "error": null
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `job_id` | string | Unique job identifier |
| `status` | string | Current processing status (see Status Values) |
| `progress` | integer | Progress percentage (0-100) |
| `created_at` | string | Job creation timestamp |
| `updated_at` | string | Last status update timestamp |
| `error` | string \| null | Error message if status is `failed` |

#### Status Values

| Status | Description |
|--------|-------------|
| `queued` | Job is waiting to be processed |
| `preprocessing` | Audio is being converted/prepared |
| `transcribing` | Speech-to-text in progress |
| `postprocessing` | Transcript cleanup in progress |
| `summarizing` | Generating summary |
| `done` | Processing complete, results available |
| `failed` | Processing failed (see `error` field) |

#### Status Flow Diagram

```
queued → preprocessing → transcribing → postprocessing → summarizing → done
                                                                       ↓
                                                                    failed
```

#### Errors

| Status | Error | Description |
|--------|-------|-------------|
| 404 | NOT_FOUND | Job not found |
| 500 | INTERNAL_ERROR | Server error |

#### Example (cURL)

```bash
curl "http://localhost:8000/v1/jobs/550e8400-e29b-41d4-a716-446655440000"
```

#### Polling Strategy (Recommended)

```javascript
async function pollJobStatus(jobId, interval = 2000, maxAttempts = 300) {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`http://localhost:8000/v1/jobs/${jobId}`);
    const data = await response.json();
    
    if (data.status === 'done') {
      return data;
    }
    
    if (data.status === 'failed') {
      throw new Error(data.error);
    }
    
    // Update UI with progress
    console.log(`Progress: ${data.progress}%`);
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  throw new Error('Timeout waiting for job completion');
}
```

---

### 3. Get Job Result

Retrieve the transcript and summary for a completed job.

**Endpoint:** `GET /v1/jobs/{job_id}/result`

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `job_id` | string (UUID) | Job identifier |

#### Response

**Status:** `200 OK`

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "transcript": "Today we're going to discuss machine learning fundamentals...",
  "segments": [
    {
      "start": 0.0,
      "end": 5.52,
      "text": "Today we're going to discuss machine learning fundamentals."
    },
    {
      "start": 5.52,
      "end": 12.84,
      "text": "Machine learning is a subset of artificial intelligence."
    },
    {
      "start": 12.84,
      "end": 20.16,
      "text": "It enables systems to learn from data without being explicitly programmed."
    }
  ],
  "summary": {
    "tldr": "• Machine learning enables systems to learn from data\n• Three main types: supervised, unsupervised, reinforcement\n• Key applications include...",
    "outline": [
      {
        "title": "Introduction",
        "timestamp": "00:00:00",
        "content": "Overview of machine learning concepts and importance in modern applications."
      },
      {
        "title": "Main Content",
        "timestamp": "00:05:30",
        "content": "Deep dive into supervised learning techniques including classification and regression."
      },
      {
        "title": "Conclusion",
        "timestamp": "00:45:00",
        "content": "Summary of key takeaways and recommended next steps for learning."
      }
    ],
    "key_points": [
      "Machine learning is a subset of AI that learns from data",
      "Supervised learning uses labeled data for training",
      "Neural networks are inspired by biological neurons",
      "Overfitting occurs when models memorize training data",
      "Cross-validation helps evaluate model performance"
    ],
    "action_items": [
      "Complete the hands-on exercise by next week",
      "Review the additional reading materials",
      "Set up the development environment"
    ],
    "quiz_points": [
      {
        "question": "What are the three main types of machine learning?",
        "concept": "Understanding ML paradigms",
        "difficulty": "easy"
      },
      {
        "question": "Explain the difference between overfitting and underfitting",
        "concept": "Model generalization",
        "difficulty": "medium"
      }
    ]
  },
  "metrics": {
    "preprocessing_seconds": 2.5,
    "transcription_seconds": 45.0,
    "postprocessing_seconds": 1.2,
    "summarization_seconds": 5.0
  }
}
```

#### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `job_id` | string | Unique job identifier |
| `transcript` | string | Full transcript text |
| `segments` | array | Transcript segments with timestamps (see below) |
| `summary` | object | Structured summary (see below) |
| `metrics` | object | Processing time metrics (seconds) |

#### Transcript Segment

Each segment contains a portion of the transcript with its exact timing in the audio.

| Field | Type | Description |
|-------|------|-------------|
| `start` | float | Start time in seconds from audio beginning |
| `end` | float | End time in seconds from audio beginning |
| `text` | string | Transcribed text for this segment |

**Example Usage (Jumping to timestamp):**
```javascript
// Find segment containing specific time (e.g., 10 seconds)
const targetTime = 10;
const segment = segments.find(s => s.start <= targetTime && s.end >= targetTime);
console.log(segment.text); // Text at 10 seconds

// Sync with audio player
audioPlayer.addEventListener('timeupdate', () => {
  const currentTime = audioPlayer.currentTime;
  const activeSegment = segments.find(s => 
    s.start <= currentTime && s.end >= currentTime
  );
  if (activeSegment) {
    highlightText(activeSegment.text);
  }
});
```

#### Summary Object

| Field | Type | Description |
|-------|------|-------------|
| `tldr` | string | Brief 5-line bullet point summary |
| `outline` | array | Section summaries with timestamps |
| `key_points` | array[string] | 8-15 key bullet points |
| `action_items` | array[string] | Extracted action items/tasks |
| `quiz_points` | array | Study quiz questions |

#### Section Summary (outline item)

| Field | Type | Description |
|-------|------|-------------|
| `title` | string | Section title |
| `timestamp` | string | Start timestamp (HH:MM:SS) |
| `content` | string | Section summary text |

#### Quiz Point

| Field | Type | Description |
|-------|------|-------------|
| `question` | string | Quiz question |
| `concept` | string | Underlying concept being tested |
| `difficulty` | string | `easy`, `medium`, or `hard` |

#### Errors

| Status | Error | Description |
|--------|-------|-------------|
| 400 | VALIDATION_ERROR | Job not completed or failed |
| 404 | NOT_FOUND | Job not found |
| 500 | INTERNAL_ERROR | Server error |

#### Example (cURL)

```bash
curl "http://localhost:8000/v1/jobs/550e8400-e29b-41d4-a716-446655440000/result"
```

---

### 4. Retry Failed Job

Retry a job that previously failed.

**Endpoint:** `POST /v1/jobs/{job_id}/retry`

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `job_id` | string (UUID) | Job identifier of failed job |

#### Response

**Status:** `200 OK`

```json
{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "queued",
  "progress": 0,
  "created_at": "2026-01-30T10:30:00Z",
  "updated_at": "2026-01-30T11:00:00Z",
  "error": null
}
```

#### Errors

| Status | Error | Description |
|--------|-------|-------------|
| 400 | VALIDATION_ERROR | Job is not in failed state |
| 404 | NOT_FOUND | Job not found |
| 500 | INTERNAL_ERROR | Server error |

#### Example (cURL)

```bash
curl -X POST "http://localhost:8000/v1/jobs/550e8400-e29b-41d4-a716-446655440000/retry"
```

---

### 5. Health Check

Check API health status.

**Endpoint:** `GET /health`

#### Response

**Status:** `200 OK`

```json
{
  "status": "healthy",
  "version": "0.1.0",
  "device": "cpu"
}
```

---

## Complete Flow Example

### Frontend Integration (React/TypeScript)

```typescript
interface JobCreateResponse {
  job_id: string;
  status: string;
  created_at: string;
}

interface JobStatusResponse {
  job_id: string;
  status: 'queued' | 'preprocessing' | 'transcribing' | 'postprocessing' | 'summarizing' | 'done' | 'failed';
  progress: number;
  created_at: string;
  updated_at: string;
  error: string | null;
}

interface JobResultResponse {
  job_id: string;
  transcript: string;
  summary: {
    tldr: string;
    outline: Array<{
      title: string;
      timestamp: string;
      content: string;
    }>;
    key_points: string[];
    action_items: string[];
    quiz_points: Array<{
      question: string;
      concept: string;
      difficulty: 'easy' | 'medium' | 'hard';
    }>;
  };
  metrics: Record<string, number>;
}

// Upload and process audio
async function transcribeAudio(file: File): Promise<JobResultResponse> {
  // 1. Create job
  const formData = new FormData();
  formData.append('audio_file', file);
  
  const createRes = await fetch('/v1/jobs', {
    method: 'POST',
    body: formData
  });
  
  if (!createRes.ok) {
    throw new Error('Failed to create job');
  }
  
  const { job_id }: JobCreateResponse = await createRes.json();
  
  // 2. Poll for completion
  while (true) {
    const statusRes = await fetch(`/v1/jobs/${job_id}`);
    const status: JobStatusResponse = await statusRes.json();
    
    if (status.status === 'done') {
      break;
    }
    
    if (status.status === 'failed') {
      throw new Error(status.error || 'Job failed');
    }
    
    // Wait 2 seconds before next poll
    await new Promise(r => setTimeout(r, 2000));
  }
  
  // 3. Get result
  const resultRes = await fetch(`/v1/jobs/${job_id}/result`);
  return resultRes.json();
}
```

---

## Rate Limits

Currently no rate limits enforced (development mode).

---

## Notes for Frontend Development

1. **File Size Validation**: Validate file size (max 500MB) before upload to provide immediate user feedback.

2. **Progress UI**: Use the `progress` field (0-100) to show a progress bar during transcription.

3. **Status Messages**: Map status values to user-friendly messages:
   - `queued` → "Waiting to process..."
   - `preprocessing` → "Preparing audio..."
   - `transcribing` → "Transcribing audio..."
   - `postprocessing` → "Cleaning up transcript..."
   - `summarizing` → "Generating summary..."
   - `done` → "Complete!"
   - `failed` → "Failed: {error}"

4. **Polling Interval**: Recommended 2-3 seconds. Adjust based on UX needs.

5. **Timeout Handling**: Consider ~10 minute timeout for long audio files.

6. **Retry Logic**: Implement retry button for failed jobs using the retry endpoint.

7. **Idempotency**: Same file uploads return existing job, so handle `status: "done"` in create response.

---

## OpenAPI/Swagger

Interactive API documentation available at:
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **OpenAPI JSON:** `http://localhost:8000/openapi.json`
