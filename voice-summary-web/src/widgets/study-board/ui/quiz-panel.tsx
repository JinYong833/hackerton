import { QuizCard } from '@/features/take-quiz';
import type { QuizPoint } from '@/entities/job';

interface QuizPanelProps {
  quizPoints: QuizPoint[];
}

export const QuizPanel = ({ quizPoints }: QuizPanelProps) => {
  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quiz</h2>
        <QuizCard questions={quizPoints} />
      </div>
    </div>
  );
};
