import React from 'react';
import type { State } from '../types';
import {
  calculateLevel,
  levelProgress,
  levelRange
} from '../achievement';

type Props = {
  state: State;
};

export default function LevelCard({
  state
}: Props) {
  const level =
    state.level ||
    calculateLevel(state.xp);

  const range =
    levelRange(level);

  const progress =
    levelProgress(
      state.xp,
      level
    );

  return (
    <section className="levelCard">
      <div className="levelTop">
        <div>
          <small>LEVEL</small>

          <h2>
            ⭐ Level {level}
          </h2>
        </div>

        <b>
          {state.xp} XP
        </b>
      </div>

      <div className="levelBar">
        <div
          className="levelFill"
          style={{
            width: `${progress}%`
          }}
        />
      </div>

      <div className="levelMeta">
        <span>
          {range.current} XP
        </span>

        <span>
          {level === 5
            ? 'MAX'
            : `${range.next} XP`}
        </span>
      </div>

      <p className="levelText">
        {level === 5
          ? 'Maximum level reached.'
          : `${state.xp} / ${range.next} XP`}
      </p>
    </section>
  );
}
