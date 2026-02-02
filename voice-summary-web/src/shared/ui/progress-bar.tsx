import { cn } from '@/shared/lib';

interface ProgressBarProps {
  current: number;
  total: number;
  onSeek?: (time: number) => void;
  className?: string;
  showPercentage?: boolean;
}

export const ProgressBar = ({
  current,
  total,
  onSeek,
  className,
  showPercentage = false,
}: ProgressBarProps) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * total;
    onSeek(newTime);
  };

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'h-2 bg-gray-200 rounded-full overflow-hidden',
          onSeek && 'cursor-pointer hover:bg-gray-300 transition-colors'
        )}
        onClick={handleClick}
        role={onSeek ? 'slider' : undefined}
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-blue-600 rounded-full transition-all duration-100"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <span className="absolute right-0 -top-6 text-xs text-gray-500">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};
