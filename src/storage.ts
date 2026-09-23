import type {
  State,
  WordProgress,
  Achievement,
  Badge
} from './types';

const KEY = 'wordlock-v2';

export const defaultProgress = (): WordProgress => ({
  seen: 0,
  correct: 0,
  wrong: 0,
  unknown: 0,
  accuracy: 0,
  status: 'new',
  correctStreak: 0,
  reviewStage: 0,
  questionTypes: [],
  daysCorrect: []
});

export const defaultAchievements = (): Achievement[] => [
  {
    id: 'first-challenge',
    title: 'First Challenge',
    description: 'Complete your first challenge',
    unlocked: false
  },
  {
    id: 'first-favorite',
    title: 'First Favorite',
    description: 'Add your first favorite word',
    unlocked: false
  },
  {
    id: 'first-master',
    title: 'First Master',
    description: 'Reach Master status for one word',
    unlocked: false
  },
  {
    id: 'ten-challenges',
    title: '10 Challenges',
    description: 'Complete 10 challenges',
    unlocked: false
  },
  {
    id: 'hundred-correct',
    title: '100 Correct Answers',
    description: 'Answer 100 questions correctly',
    unlocked: false
  },
  {
    id: 'thousand-xp',
    title: '1000 XP',
    description: 'Earn 1000 XP',
    unlocked: false
  }
];

export const defaultBadges = (): Badge[] => [];

export const defaults: State = {
  version: 4,

  learningDay: 1,

  settings: {
    dailyWords: 5,
    challengeSize: 20,
    showTurkishAfterWrong: true,
    showExamplesAfterWrong: true,
    includeFavorites: true
  },

  favorites: [],
  learned: [],

  todayIds: [],
  todayCursor: 0,
  todayCompleted: false,

  xp: 0,
  streak: 0,

  progress: {},

  /* Sprint 4A */

  level: 1,

  totalChallenges: 0,

  totalCorrectAnswers: 0,

  badges: defaultBadges(),

  achievements: defaultAchievements()
};

export function loadState(): State {
  try {
    const old = JSON.parse(
      localStorage.getItem(KEY) ||
      localStorage.getItem('wordlock-v2-sprint1') ||
      '{}'
    );

    return {
      ...defaults,
      ...old,

      version: 4,

      settings: {
        ...defaults.settings,
        ...old.settings
      },

      progress: old.progress || {},

      level: old.level || 1,

      totalChallenges:
        old.totalChallenges || 0,

      totalCorrectAnswers:
        old.totalCorrectAnswers || 0,

      badges:
        old.badges || defaultBadges(),

      achievements:
        old.achievements ||
        defaultAchievements()
    };
  } catch {
    return defaults;
  }
}

export const saveState = (state: State) =>
  localStorage.setItem(
    KEY,
    JSON.stringify(state)
  );

export const resetState = () => {
  localStorage.removeItem(KEY);
  localStorage.removeItem(
    'wordlock-v2-sprint1'
  );
};
