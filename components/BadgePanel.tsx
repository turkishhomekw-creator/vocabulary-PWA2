import React from 'react';
import type {
  Badge,
  State
} from '../types';

type Props = {
  state: State;
};

function badgeIcon(
  badge: Badge
) {
  switch (badge) {
    case 'Starter':
      return '🥉';

    case 'Consistent Learner':
      return '🥈';

    case 'Vocabulary Builder':
      return '🥇';

    case 'Word Master':
      return '🏆';

    default:
      return '🏅';
  }
}

export default function BadgePanel({
  state
}: Props) {
  return (
    <section className="badgePanel">
      <div className="badgeHeader">
        <div>
          <small>BADGES</small>

          <h2>
            {state.badges.length}{' '}
            Rozet
          </h2>
        </div>
      </div>

      {!state.badges.length ? (
        <div className="emptyBadge">
          İlk rozetini kazanmak
          için challenge
          tamamla.
        </div>
      ) : (
        <div className="badgeGrid">
          {state.badges.map(
            badge => (
              <div
                key={badge}
                className="badgeCard"
              >
                <div className="badgeIcon">
                  {badgeIcon(
                    badge
                  )}
                </div>

                <div className="badgeTitle">
                  {badge}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </section>
  );
}
