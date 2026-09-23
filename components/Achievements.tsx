import React from 'react';
import type { State } from '../types';

type Props = {
  state: State;
  back: () => void;
};

export default function Achievements({
  state,
  back
}: Props) {
  const unlocked =
    state.achievements.filter(
      a => a.unlocked
    ).length;

  return (
    <main className="page">
      <button
        className="back"
        onClick={back}
      >
        ← Ana Sayfa
      </button>

      <div className="title">
        <h1>Achievements</h1>

        <p>
          {unlocked} /{' '}
          {state.achievements.length}{' '}
          unlocked
        </p>
      </div>

      <div className="achievementGrid">
        {state.achievements.map(a => (
          <article
            key={a.id}
            className={
              a.unlocked
                ? 'achievementCard unlocked'
                : 'achievementCard'
            }
          >
            <div className="achievementIcon">
              {a.unlocked
                ? '🏅'
                : '🔒'}
            </div>

            <h3>{a.title}</h3>

            <p>
              {a.description}
            </p>

            {a.unlocked ? (
              <small>
                Unlocked
                {a.unlockedDate
                  ? ` • ${a.unlockedDate}`
                  : ''}
              </small>
            ) : (
              <small>
                Not completed yet
              </small>
            )}
          </article>
        ))}
      </div>

      <section className="panel">
        <h2>Badges</h2>

        {!state.badges.length ? (
          <p>
            Henüz rozet
            kazanılmadı.
          </p>
        ) : (
          <div className="badgeList">
            {state.badges.map(
              badge => (
                <span
                  key={badge}
                  className="badge"
                >
                  {badge ===
                    'Starter' &&
                    '🥉 '}
                  {badge ===
                    'Consistent Learner' &&
                    '🥈 '}
                  {badge ===
                    'Vocabulary Builder' &&
                    '🥇 '}
                  {badge ===
                    'Word Master' &&
                    '🏆 '}

                  {badge}
                </span>
              )
            )}
          </div>
        )}
      </section>
    </main>
  );
}
