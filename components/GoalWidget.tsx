import React from 'react';
import type { State } from '../types';

type Props = {
  state: State;
};

export default function GoalWidget({
  state
}: Props) {
  const wordsDone = state.todayCompleted
    ? state.settings.dailyWords
    : Math.min(
        state.todayCursor + 1,
        state.settings.dailyWords
      );

  const wordsTarget =
    state.settings.dailyWords;

  const wordsPercent =
    Math.round(
      (wordsDone / wordsTarget) * 100
    );

  const challengeDone =
    state.lastResult
      ? state.lastResult.correct +
        state.lastResult.wrong +
        state.lastResult.unknown
      : 0;

  const challengeTarget =
    state.settings.challengeSize;

  const challengePercent =
    Math.min(
      100,
      Math.round(
        (challengeDone /
          challengeTarget) *
          100
      )
    );

  const allCompleted =
    wordsPercent === 100 &&
    challengePercent === 100;

  return (
    <section className="goalWidget">
      <div className="goalHeader">
        <div>
          <small>
            GÜNLÜK HEDEF
          </small>

          <h2>
            {allCompleted
              ? '🏆 Tamamlandı'
              : '🎯 Devam Ediyor'}
          </h2>
        </div>

        {allCompleted && (
          <span className="goalBonus">
            +50 XP
          </span>
        )}
      </div>

      <div className="goalItem">
        <div className="goalRow">
          <span>
            Yeni Kelimeler
          </span>

          <b>
            {wordsDone}/
            {wordsTarget}
          </b>
        </div>

        <div className="goalBar">
          <div
            className="goalFill"
            style={{
              width:
                `${wordsPercent}%`
            }}
          />
        </div>
      </div>

      <div className="goalItem">
        <div className="goalRow">
          <span>
            Challenge
          </span>

          <b>
            {challengeDone}/
            {challengeTarget}
          </b>
        </div>

        <div className="goalBar">
          <div
            className="goalFill challenge"
            style={{
              width:
                `${challengePercent}%`
            }}
          />
        </div>
      </div>
    </section>
  );
}
