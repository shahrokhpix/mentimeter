'use client';

import React, { useEffect, useState } from 'react';
import { useSessionSocket } from '../../../hooks/useSessionSocket';
import styles from './styles.module.css';
import Ranking from '../../../components/Ranking';

type Slide = {
  id: string;
  type: 'mc' | 'open' | 'quiz' | 'ranking' | 'scale';
  content: string;
  choices?: { id: string; text: string }[];
};

const SessionPage = ({ params }: { params: { id:string } }) => {
  const [currentSlide, setCurrentSlide] = useState<Slide | null>(null);
  const [openTextResponse, setOpenTextResponse] = useState('');

  const { on, emit } = useSessionSocket(params.id);

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
    <div className={styles.container}>
      <h1>Session {params.id}</h1>
      {currentSlide ? (
        <div className={styles.slideContainer}>
          <h2>{currentSlide.content}</h2>
          {(currentSlide.type === 'mc' || currentSlide.type === 'quiz') && (
            <div style={{ marginTop: '2rem' }}>
              {currentSlide.choices?.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleResponse({ choice: choice.id })}
                  className={styles.button}
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
                className={styles.input}
              />
              <button
                onClick={() => handleResponse({ text: openTextResponse })}
                className={styles.submitButton}
              >
                Submit
              </button>
            </div>
          )}
          {currentSlide.type === 'ranking' && currentSlide.choices && (
            <Ranking
              choices={currentSlide.choices}
              onRank={(rankedChoices) => handleResponse({ rankedChoices })}
            />
          )}
          {currentSlide.type === 'scale' && (
            <div style={{ marginTop: '2rem' }}>
              <input type="range" min="1" max="5" />
              <button
                onClick={() => handleResponse({ value: 3 })} // Dummy value
                className={styles.submitButton}
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