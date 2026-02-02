import type { Summary as SummaryType, SectionSummary } from '@/entities/job';
import { Card, CardContent, CardHeader } from '@/shared/ui';
import { cn } from '@/shared/lib';
import { FileText, ListChecks, Target, HelpCircle } from 'lucide-react';

interface SummarySectionProps {
  summary: SummaryType;
}

export const SummarySection = ({ summary }: SummarySectionProps) => {
  return (
    <div className="space-y-6">
      {/* TL;DR */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold">TL;DR</h3>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed">{summary.tldr}</p>
        </CardContent>
      </Card>

      {/* Outline */}
      {summary.outline && summary.outline.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-semibold">Outline</h3>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.outline.map((section: SectionSummary, index: number) => (
                <div key={index} className="border-l-2 border-purple-200 pl-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-mono text-purple-600">
                      {section.timestamp}
                    </span>
                    <h4 className="font-medium text-gray-900">{section.title}</h4>
                  </div>
                  <p className="text-gray-600 text-sm">{section.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Points */}
      {summary.key_points && summary.key_points.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Key Points</h3>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.key_points.map((point: string, index: number) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Action Items */}
      {summary.action_items && summary.action_items.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-orange-600" />
              <h3 className="text-lg font-semibold">Action Items</h3>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {summary.action_items.map((item: string, index: number) => (
                <li key={index} className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Quiz Points Preview */}
      {summary.quiz_points && summary.quiz_points.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold">
                Quiz ({summary.quiz_points.length} questions)
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              Test your understanding with these quiz questions based on the content.
            </p>
            <div className="space-y-2">
              {summary.quiz_points.slice(0, 3).map((quiz, index: number) => (
                <div
                  key={quiz.id}
                  className={cn(
                    'p-3 rounded-lg',
                    quiz.difficulty === 'easy' && 'bg-green-50 border border-green-200',
                    quiz.difficulty === 'medium' && 'bg-yellow-50 border border-yellow-200',
                    quiz.difficulty === 'hard' && 'bg-red-50 border border-red-200'
                  )}
                >
                  <span className="text-sm text-gray-500">Q{index + 1}: </span>
                  <span className="text-gray-800">{quiz.question}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
