import { useEffect, useRef, useMemo } from 'react';
import type { TranscriptSegment as TranscriptSegmentType } from '@/entities/job';
import { TranscriptSegment } from './transcript-segment';

interface TranscriptListProps {
  segments: TranscriptSegmentType[];
  currentTime: number;
  onSeek?: (time: number) => void;
}

export const TranscriptList = ({
  segments,
  currentTime,
  onSeek,
}: TranscriptListProps) => {
  const activeRef = useRef<HTMLDivElement>(null);

  const activeIndex = useMemo(
    () =>
      segments.findIndex(
        (seg) => currentTime >= seg.start && currentTime < seg.end
      ),
    [segments, currentTime]
  );

  useEffect(() => {
    if (activeRef.current) {
      activeRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [activeIndex]);

  if (!segments || segments.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No transcript available</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {segments.map((segment, index) => (
        <div key={segment.id} ref={index === activeIndex ? activeRef : null}>
          <TranscriptSegment
            segment={segment}
            isActive={index === activeIndex}
            onSeek={onSeek}
          />
        </div>
      ))}
    </div>
  );
};
