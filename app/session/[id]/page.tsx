'use client';

import React, { useEffect, useState } from 'react';
import { useSessionSocket } from '../../../hooks/useSessionSocket';

const SessionPage = ({ params }: { params: { id:string } }) => {
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useSessionSocket(params.id, token);

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
      <h1>Session {params.id}</h1>
      <p>You have joined the session.</p>
    </div>
  );
};

export default SessionPage;