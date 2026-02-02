import { SummarySection } from '@/entities/summary';
import type { Summary } from '@/entities/job';

interface SummaryPanelProps {
  summary: Summary;
}

export const SummaryPanel = ({ summary }: SummaryPanelProps) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Summary</h2>
        <SummarySection summary={summary} />
      </div>
    </div>
  );
};
