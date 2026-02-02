import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui';
import { useIsMobile } from '@/shared/hooks';
import type { TranscriptSegment, Summary } from '@/entities/job';
import { TranscriptPanel } from './transcript-panel';
import { SummaryPanel } from './summary-panel';
import { QuizPanel } from './quiz-panel';

interface StudyBoardProps {
  transcript: TranscriptSegment[];
  summary: Summary;
}

export const StudyBoard = ({ transcript, summary }: StudyBoardProps) => {
  const isMobile = useIsMobile();

  // Mobile: Tabbed view
  if (isMobile) {
    return (
      <Tabs defaultValue="transcript" className="h-full flex flex-col">
        <div className="px-4 pt-4 bg-white border-b">
          <TabsList className="w-full">
            <TabsTrigger value="transcript" className="flex-1">
              Transcript
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex-1">
              Summary
            </TabsTrigger>
            <TabsTrigger value="quiz" className="flex-1">
              Quiz
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-1 overflow-hidden">
          <TabsContent value="transcript" className="h-full m-0">
            <TranscriptPanel segments={transcript} />
          </TabsContent>
          <TabsContent value="summary" className="h-full m-0">
            <SummaryPanel summary={summary} />
          </TabsContent>
          <TabsContent value="quiz" className="h-full m-0">
            <QuizPanel quizPoints={summary.quiz_points} />
          </TabsContent>
        </div>
      </Tabs>
    );
  }

  // Desktop: Split view
  return (
    <div className="grid md:grid-cols-2 gap-4 h-full p-4">
      {/* Left: Transcript */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <TranscriptPanel segments={transcript} />
      </div>

      {/* Right: Summary + Quiz (tabbed) */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <Tabs defaultValue="summary" className="h-full flex flex-col">
          <div className="px-4 pt-4 border-b">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
            </TabsList>
          </div>
          <div className="flex-1 overflow-hidden">
            <TabsContent value="summary" className="h-full m-0">
              <SummaryPanel summary={summary} />
            </TabsContent>
            <TabsContent value="quiz" className="h-full m-0">
              <QuizPanel quizPoints={summary.quiz_points} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};
