'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

const JoinPage = () => {
  const [joinCode, setJoinCode] = useState('');
  const router = useRouter();

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) return;

    try {
      const response = await fetch('/api/sessions/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: joinCode }),
      });

      if (response.ok) {
        const { sessionId } = await response.json();
        router.push(`/session/${sessionId}`);
      } else {
        console.error('Failed to join session');
      }
    } catch (error) {
      console.error('Failed to join session:', error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
      }}
    >
      <h1>Join a Presentation</h1>
      <form onSubmit={handleJoinSession} style={{ marginTop: '2rem' }}>
        <input
          type="text"
          value={joinCode}
          onChange={(e) => setJoinCode(e.target.value)}
          placeholder="Enter join code"
          style={{
            padding: '0.5rem',
            fontSize: '1.2rem',
            textAlign: 'center',
            letterSpacing: '0.2rem',
            textTransform: 'uppercase',
          }}
        />
        <button
          type="submit"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1.2rem',
            marginLeft: '1rem',
          }}
        >
          Join
        </button>
      </form>
    </div>
  );
};

export default JoinPage;