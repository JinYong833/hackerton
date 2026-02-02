import { memo } from 'react';
import { cn, formatTimestamp } from '@/shared/lib';
import type { TranscriptSegment as TranscriptSegmentType } from '@/entities/job';

interface TranscriptSegmentProps {
  segment: TranscriptSegmentType;
  isActive: boolean;
  onSeek?: (time: number) => void;
}

export const TranscriptSegment = memo(
  ({ segment, isActive, onSeek }: TranscriptSegmentProps) => {
    return (
      <div
        onClick={() => onSeek?.(segment.start)}
        className={cn(
          'py-2 px-4 rounded cursor-pointer transition group',
          'hover:bg-blue-50',
          isActive && 'bg-blue-100 border-l-4 border-blue-500'
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSeek?.(segment.start);
          }
        }}
      >
        <span
          className={cn(
            'text-xs font-mono mr-3 transition',
            isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-500'
          )}
        >
          {formatTimestamp(segment.start)}
        </span>
        <span
          className={cn('text-gray-800 leading-relaxed', isActive && 'font-medium')}
        >
          {segment.text}
        </span>
      </div>
    );
  }
);

TranscriptSegment.displayName = 'TranscriptSegment';
