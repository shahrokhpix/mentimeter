'use client';

import React, { useState, useEffect } from 'react';
import { useSessionSocket } from '../hooks/useSessionSocket';

type LeaderboardProps = {
  sessionId: string;
};

type Scores = {
  [key: string]: number;
};

const Leaderboard = ({ sessionId }: LeaderboardProps) => {
  const [scores, setScores] = useState<Scores>({});
  const { on } = useSessionSocket(sessionId);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await fetch(`/api/leaderboard/${sessionId}`);
        if (response.ok) {
          const data = await response.json();
          setScores(data.scores);
        }
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      }
    };
    fetchLeaderboard();

    const handleLeaderboardUpdated = () => {
      fetchLeaderboard();
    };

    const unsubscribe = on('leaderboard updated', handleLeaderboardUpdated);

    return () => {
      unsubscribe();
    };
  }, [sessionId, on]);

  const sortedScores = Object.entries(scores).sort(([, a], [, b]) => b - a);

  return (
    <div>
      <h2>Leaderboard</h2>
      <ol>
        {sortedScores.map(([userId, score]) => (
          <li key={userId}>
            User {userId.substring(0, 6)}: {score}
          </li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard;