'use client';

import React, { useEffect, useState } from 'react';
import { useSessionSocket } from '../../../hooks/useSessionSocket';

type Slide = {
  id: string;
  type: 'mc' | 'open';
  content: string;
  choices?: { id: string; text: string }[];
};

const SessionPage = ({ params }: { params: { id:string } }) => {
  const [token, setToken] = useState('');
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);
  const [openTextResponse, setOpenTextResponse] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const { on, emit } = useSessionSocket(params.id, token);

  useEffect(() => {
    const handleSlideChanged = (slide: Slide) => {
      setCurrentSlide(slide);
    };

    const unsubscribe = on('slide changed', handleSlideChanged);

    return () => {
      unsubscribe();
    };
  }, [on]);

  const handleResponse = async (payload: any) => {
    try {
      const response = await fetch('/api/responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sessionId: params.id,
          slideId: currentSlide?.id,
          payload,
        }),
      });

      if (response.ok) {
        const newResponse = await response.json();
        emit('response', newResponse);
      } else {
        console.error('Failed to submit response');
      }
    } catch (error) {
      console.error('Failed to submit response:', error);
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
      <h1>Session {params.id}</h1>
      {currentSlide ? (
        <div>
          <h2>{currentSlide.content}</h2>
          {currentSlide.type === 'mc' && (
            <div style={{ marginTop: '2rem' }}>
              {currentSlide.choices?.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleResponse({ choice: choice.id })}
                  style={{
                    display: 'block',
                    width: '100%',
                    padding: '1rem',
                    margin: '0.5rem 0',
                    fontSize: '1.2rem',
                  }}
                >
                  {choice.text}
                </button>
              ))}
            </div>
          )}
          {currentSlide.type === 'open' && (
            <div style={{ marginTop: '2rem' }}>
              <input
                type="text"
                value={openTextResponse}
                onChange={(e) => setOpenTextResponse(e.target.value)}
                placeholder="Enter your answer"
                style={{
                  width: '100%',
                  padding: '1rem',
                  fontSize: '1.2rem',
                }}
              />
              <button
                onClick={() => handleResponse({ text: openTextResponse })}
                style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}
              >
                Submit
              </button>
            </div>
          )}
        </div>
      ) : (
        <p>Waiting for the presentation to start...</p>
      )}
    </div>
  );
};

export default SessionPage;