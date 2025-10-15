'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSessionSocket } from '../../../hooks/useSessionSocket';

const PresenterPage = ({ params }: { params: { id: string } }) => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const joinCode = searchParams.get('join_code');
  const [joinedUsers, setJoinedUsers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const { on, connected } = useSessionSocket(sessionId || '', token);

  useEffect(() => {
    if (connected) {
      setIsLoading(false);
    }
  }, [connected]);

  useEffect(() => {
    const handleUserJoined = (userId: string) => {
      setJoinedUsers((prevUsers) => [...prevUsers, userId]);
    };

    const unsubscribe = on('user joined', handleUserJoined);

    return () => {
      unsubscribe();
    };
  }, [on]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

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
      <h1>Presenting Presentation {params.id}</h1>
      <div style={{ marginTop: '2rem' }}>
        <h2>Join with code:</h2>
        <p style={{ fontSize: '2rem', fontWeight: 'bold', letterSpacing: '0.5rem' }}>
          {joinCode}
        </p>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h3>Joined Users:</h3>
        <ul>
          {joinedUsers.map((userId) => (
            <li key={userId}>{userId}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PresenterPage;