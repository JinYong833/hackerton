import { Button } from '@/shared/ui';
import { cn, formatTimestamp, PLAYBACK_RATES } from '@/shared/lib';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';

interface PlaybackControlsProps {
  isPlaying: boolean;
  playbackRate: number;
  isMuted: boolean;
  onPlayPause: () => void;
  onSkipBack: () => void;
  onSkipForward: () => void;
  onPlaybackRateChange: (rate: number) => void;
  onMuteToggle: () => void;
  currentTime: number;
  duration: number;
}

export const PlaybackControls = ({
  isPlaying,
  playbackRate,
  isMuted,
  onPlayPause,
  onSkipBack,
  onSkipForward,
  onPlaybackRateChange,
  onMuteToggle,
  currentTime,
  duration,
}: PlaybackControlsProps) => {
  const cyclePlaybackRate = () => {
    const currentIndex = PLAYBACK_RATES.indexOf(playbackRate);
    const nextIndex = (currentIndex + 1) % PLAYBACK_RATES.length;
    onPlaybackRateChange(PLAYBACK_RATES[nextIndex]);
  };

  return (
    <div className="flex items-center justify-between px-4 py-3">
      {/* Time display */}
      <div className="flex items-center gap-2 min-w-[100px]">
        <span className="text-sm font-mono text-gray-600">
          {formatTimestamp(currentTime)}
        </span>
        <span className="text-gray-400">/</span>
        <span className="text-sm font-mono text-gray-400">
          {formatTimestamp(duration)}
        </span>
      </div>

      {/* Main controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onSkipBack}
          aria-label="Skip back 10 seconds"
        >
          <SkipBack className="h-5 w-5" />
        </Button>

        <Button
          variant="primary"
          size="lg"
          className="rounded-full w-12 h-12 p-0"
          onClick={onPlayPause}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-0.5" />
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onSkipForward}
          aria-label="Skip forward 10 seconds"
        >
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      {/* Secondary controls */}
      <div className="flex items-center gap-3 min-w-[100px] justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={cyclePlaybackRate}
          className="font-mono text-xs min-w-[50px]"
          aria-label={`Playback speed: ${playbackRate}x`}
        >
          {playbackRate}x
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onMuteToggle}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? (
            <VolumeX className={cn('h-5 w-5', 'text-gray-400')} />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};
