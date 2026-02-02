import { TranscriptList } from '@/entities/transcript';
import type { TranscriptSegment } from '@/entities/job';
import { useAudioPlayer } from '@/widgets/audio-player-bar';

interface TranscriptPanelProps {
  segments: TranscriptSegment[];
}

export const TranscriptPanel = ({ segments }: TranscriptPanelProps) => {
  const { currentTime, seekTo } = useAudioPlayer();

  const handleSeek = (time: number) => {
    seekTo(time);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Transcript</h2>
        <TranscriptList
          segments={segments}
          currentTime={currentTime}
          onSeek={handleSeek}
        />
      </div>
    </div>
  );
};
