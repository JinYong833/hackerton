import { useState } from 'react';
import type { QuizPoint } from '@/entities/job';

interface QuizSession {
  currentIndex: number;
  answers: Map<string, number>;
  isComplete: boolean;
}

export const useQuizSession = (questions: QuizPoint[]) => {
  const [session, setSession] = useState<QuizSession>({
    currentIndex: 0,
    answers: new Map(),
    isComplete: false,
  });

  const currentQuestion = questions[session.currentIndex];
  const totalQuestions = questions.length;
  const progress = ((session.currentIndex + 1) / totalQuestions) * 100;

  const submitAnswer = (answerIndex: number) => {
    const newAnswers = new Map(session.answers);
    newAnswers.set(currentQuestion.id, answerIndex);
    setSession({ ...session, answers: newAnswers });
  };

  const nextQuestion = () => {
    if (session.currentIndex < totalQuestions - 1) {
      setSession({ ...session, currentIndex: session.currentIndex + 1 });
    } else {
      setSession({ ...session, isComplete: true });
    }
  };

  const previousQuestion = () => {
    if (session.currentIndex > 0) {
      setSession({ ...session, currentIndex: session.currentIndex - 1 });
    }
  };

  const resetQuiz = () => {
    setSession({
      currentIndex: 0,
      answers: new Map(),
      isComplete: false,
    });
  };

  const getScore = () => {
    let known = 0;    // 알고 있어요 (1)
    let unsure = 0;   // 애매해요 (0)
    let unknown = 0;  // 모르겠어요 (-1)
    
    questions.forEach((q) => {
      const userAnswer = session.answers.get(q.id);
      if (userAnswer === 1) known++;
      else if (userAnswer === 0) unsure++;
      else if (userAnswer === -1) unknown++;
    });
    
    return { known, unsure, unknown, total: totalQuestions };
  };

  return {
    currentQuestion,
    currentIndex: session.currentIndex,
    totalQuestions,
    progress,
    answers: session.answers,
    isComplete: session.isComplete,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    resetQuiz,
    getScore,
  };
};
