import { cn } from '@/shared/lib';
import { Button, Card, CardContent, ProgressBar } from '@/shared/ui';
import type { QuizPoint } from '@/entities/job';
import { useQuizSession } from '../model';
import { ChevronLeft, ChevronRight, RotateCcw, Trophy } from 'lucide-react';

interface QuizCardProps {
  questions: QuizPoint[];
}

export const QuizCard = ({ questions }: QuizCardProps) => {
  const {
    currentQuestion,
    currentIndex,
    totalQuestions,
    progress,
    answers,
    isComplete,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    resetQuiz,
    getScore,
  } = useQuizSession(questions);

  if (!questions || questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No quiz questions available</p>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    const { known, unsure, unknown, total } = getScore();
    const knownPercentage = Math.round((known / total) * 100);

    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="p-4 bg-yellow-100 rounded-full w-fit mx-auto mb-6">
            <Trophy className="h-12 w-12 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">퀴즈 완료!</h3>
          
          {/* Self-assessment results */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-green-50 rounded-lg">
              <span className="block text-2xl mb-1">✅</span>
              <span className="block text-2xl font-bold text-green-600">{known}</span>
              <span className="text-sm text-gray-600">알고 있어요</span>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <span className="block text-2xl mb-1">🤔</span>
              <span className="block text-2xl font-bold text-yellow-600">{unsure}</span>
              <span className="text-sm text-gray-600">애매해요</span>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <span className="block text-2xl mb-1">❌</span>
              <span className="block text-2xl font-bold text-red-600">{unknown}</span>
              <span className="text-sm text-gray-600">모르겠어요</span>
            </div>
          </div>
          
          <p className="text-gray-600 mb-6">
            전체 {total}문제 중 <span className="font-bold text-green-600">{knownPercentage}%</span>를 이해하고 있어요!
          </p>
          
          <Button onClick={resetQuiz} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            다시 풀기
          </Button>
        </CardContent>
      </Card>
    );
  }

  const selectedAnswer = answers.get(currentQuestion.id);

  return (
    <Card>
      <CardContent className="p-6">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>
              Question {currentIndex + 1} of {totalQuestions}
            </span>
            <span
              className={cn(
                'px-2 py-0.5 rounded text-xs font-medium',
                currentQuestion.difficulty === 'easy' &&
                  'bg-green-100 text-green-700',
                currentQuestion.difficulty === 'medium' &&
                  'bg-yellow-100 text-yellow-700',
                currentQuestion.difficulty === 'hard' && 'bg-red-100 text-red-700'
              )}
            >
              {currentQuestion.difficulty}
            </span>
          </div>
          <ProgressBar current={progress} total={100} />
        </div>

        {/* Question */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {currentQuestion.question}
          </h3>
          {currentQuestion.concept && (
            <p className="text-sm text-gray-500">
              Concept: {currentQuestion.concept}
            </p>
          )}
        </div>

        {/* Options - Show if available */}
        {currentQuestion.options && currentQuestion.options.length > 0 ? (
          <div className="space-y-3 mb-6">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                type="button"
                onClick={() => submitAnswer(index)}
                className={cn(
                  'w-full text-left p-4 rounded-lg border-2 transition-all',
                  selectedAnswer === index
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                )}
              >
                <span className="font-medium text-gray-700 mr-2">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            ))}
          </div>
        ) : (
          /* Self-assessment mode when no options provided */
          <div className="mb-6">
            <p className="text-sm text-gray-500 mb-4">
              이 문제에 대해 스스로 답을 생각해보세요. 준비되면 아래 버튼을 눌러 자기 평가를 해주세요.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => submitAnswer(1)}
                className={cn(
                  'flex-1 p-4 rounded-lg border-2 transition-all text-center',
                  selectedAnswer === 1
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                )}
              >
                <span className="block text-2xl mb-1">✅</span>
                <span className="text-sm font-medium text-gray-700">알고 있어요</span>
              </button>
              <button
                type="button"
                onClick={() => submitAnswer(0)}
                className={cn(
                  'flex-1 p-4 rounded-lg border-2 transition-all text-center',
                  selectedAnswer === 0
                    ? 'border-yellow-500 bg-yellow-50'
                    : 'border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'
                )}
              >
                <span className="block text-2xl mb-1">🤔</span>
                <span className="text-sm font-medium text-gray-700">애매해요</span>
              </button>
              <button
                type="button"
                onClick={() => submitAnswer(-1)}
                className={cn(
                  'flex-1 p-4 rounded-lg border-2 transition-all text-center',
                  selectedAnswer === -1
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-red-300 hover:bg-red-50'
                )}
              >
                <span className="block text-2xl mb-1">❌</span>
                <span className="text-sm font-medium text-gray-700">모르겠어요</span>
              </button>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <Button onClick={nextQuestion} disabled={selectedAnswer === undefined}>
            {currentIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
            {currentIndex < totalQuestions - 1 && (
              <ChevronRight className="h-4 w-4 ml-1" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
