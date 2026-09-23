import type {
  State,
  Achievement,
  Badge
} from './types';

const today = () =>
  new Date().toISOString().slice(0, 10);

export function calculateLevel(xp: number): number {
  if (xp >= 2000) return 5;
  if (xp >= 1000) return 4;
  if (xp >= 500) return 3;
  if (xp >= 100) return 2;
  return 1;
}

export function levelRange(level: number) {
  switch (level) {
    case 1:
      return { current: 0, next: 100 };

    case 2:
      return { current: 100, next: 500 };

    case 3:
      return { current: 500, next: 1000 };

    case 4:
      return { current: 1000, next: 2000 };

    default:
      return { current: 2000, next: 2000 };
  }
}

export function levelProgress(
  xp: number,
  level: number
): number {
  const range = levelRange(level);

  if (level === 5) {
    return 100;
  }

  return Math.min(
    100,
    Math.round(
      ((xp - range.current) /
        (range.next - range.current)) *
        100
    )
  );
}

function unlock(
  achievement: Achievement
): Achievement {
  if (achievement.unlocked) {
    return achievement;
  }

  return {
    ...achievement,
    unlocked: true,
    unlockedDate: today()
  };
}

export function evaluateAchievements(
  state: State
): Achievement[] {
  return state.achievements.map(a => {
    switch (a.id) {
      case 'first-challenge':
        return state.totalChallenges >= 1
          ? unlock(a)
          : a;

      case 'first-favorite':
        return state.favorites.length >= 1
          ? unlock(a)
          : a;

      case 'first-master': {
        const masters =
          Object.values(state.progress).filter(
            p => p.status === 'master'
          );

        return masters.length >= 1
          ? unlock(a)
          : a;
      }

      case 'ten-challenges':
        return state.totalChallenges >= 10
          ? unlock(a)
          : a;

      case 'hundred-correct':
        return state.totalCorrectAnswers >= 100
          ? unlock(a)
          : a;

      case 'thousand-xp':
        return state.xp >= 1000
          ? unlock(a)
          : a;

      default:
        return a;
    }
  });
}

export function evaluateBadges(
  state: State
): Badge[] {
  const badges: Badge[] = [];

  if (state.totalChallenges >= 1) {
    badges.push('Starter');
  }

  if (state.streak >= 7) {
    badges.push(
      'Consistent Learner'
    );
  }

  if (state.learned.length >= 100) {
    badges.push(
      'Vocabulary Builder'
    );
  }

  const masterCount =
    Object.values(state.progress).filter(
      p => p.status === 'master'
    ).length;

  if (masterCount >= 10) {
    badges.push('Word Master');
  }

  return badges;
}

export function updateGamification(
  state: State
): State {
  const level = calculateLevel(
    state.xp
  );

  const achievements =
    evaluateAchievements(state);

  const badges =
    evaluateBadges(state);

  return {
    ...state,
    level,
    achievements,
    badges
  };
}

export function unlockedCount(
  state: State
): number {
  return state.achievements.filter(
    a => a.unlocked
  ).length;
}

export function nextLockedAchievement(
  state: State
): Achievement | undefined {
  return state.achievements.find(
    a => !a.unlocked
  );
}
