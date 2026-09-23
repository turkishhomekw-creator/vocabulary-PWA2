export type Word = {
  id: number; word: string; pos: string; definition: string; turkish: string;
  difficulty: string; category: string; synonyms: string[]; antonyms: string[];
  examples: string[]; fillBlank: string; distractors: string[]; custom?: boolean;
};
export type Status = 'new' | 'learning' | 'strong' | 'risky' | 'master' | 'masterReview';
export type Badge = 'Starter' | 'Consistent Learner' | 'Vocabulary Builder' | 'Word Master';
export type Achievement = { id: string; title: string; description: string; unlocked: boolean; unlockedDate?: string; };
export type WordProgress = {
  seen: number; correct: number; wrong: number; unknown: number; accuracy: number;
  status: Status; correctStreak: number; reviewStage: number; lastSeen?: string;
  nextReview?: string; masterDate?: string; questionTypes: string[]; daysCorrect: string[];
};
export type Settings = {
  dailyWords: 3 | 5 | 7 | 10; challengeSize: 10 | 20 | 30;
  showTurkishAfterWrong: boolean; showExamplesAfterWrong: boolean; includeFavorites: boolean;
};
export type QType = 'definitionWord' | 'wordDefinition' | 'fillBlank' | 'synonym' | 'antonym' | 'turkish';
export type ChallengeKind = 'daily' | 'practice' | 'risky' | 'favorites' | 'master' | 'review';
export type Question = { wordId: number; type: QType; prompt: string; options: string[]; correctAnswer: string; };
export type ChallengeState = {
  kind: ChallengeKind; questions: Question[]; index: number;
  answers: { wordId: number; correct: boolean; unknown: boolean; }[];
  score: number; bestRun: number; currentRun: number; preStatuses: Record<number, Status>;
};
export type Result = {
  kind: ChallengeKind; correct: number; wrong: number; unknown: number; xp: number;
  total: number; date: string; newRisky: number[]; newMaster: number[];
};
export type State = {
  version: 5; learningDay: number; activeDate: string; settings: Settings;
  favorites: number[]; learned: number[]; customWords: Word[];
  todayIds: number[]; previewIds: number[]; todayCursor: number; todayCompleted: boolean;
  todayChallengeTarget: number; todayChallengeCompleted: number;
  xp: number; streak: number; lastCompleted?: string; progress: Record<number, WordProgress>;
  challenge?: ChallengeState; lastResult?: Result; level: number; totalChallenges: number;
  totalCorrectAnswers: number; badges: Badge[]; achievements: Achievement[];
};
export type Screen = 'home' | 'today' | 'tomorrow' | 'challenge' | 'result' | 'favorites' |
  'learned' | 'risky' | 'master' | 'settings' | 'word' | 'all' | 'review' | 'achievements' | 'custom';
