'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSessionSocket } from '../../../hooks/useSessionSocket';

type Slide = {
  id: string;
  type: 'mc' | 'open';
  content: string;
  choices?: { id: string; text: string }[];
};

type Response = {
  id: string;
  slideId: string;
  payload: any;
};

const PresenterPage = ({ params }: { params: { id: string } }) => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const joinCode = searchParams.get('join_code');
  const [joinedUsers, setJoinedUsers] = useState<string[]>([]);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState('');

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const { on, emit, connected } = useSessionSocket(sessionId || '', token);

  useEffect(() => {
    if (connected) {
      setIsLoading(false);
    }
  }, [connected]);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch(`/api/presentations/${params.id}/slides`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setSlides(data);
          if (data.length > 0) {
            emit('slide changed', data[0]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch slides:', error);
      }
    };
    if (token) {
      fetchSlides();
    }
  }, [params.id, token, emit]);

  useEffect(() => {
    const handleUserJoined = (userId: string) => {
      setJoinedUsers((prevUsers) => [...prevUsers, userId]);
    };

    const handleResponse = (response: Response) => {
      setResponses((prevResponses) => [...prevResponses, response]);
    };

    const unsubscribeUserJoined = on('user joined', handleUserJoined);
    const unsubscribeResponse = on('response', handleResponse);

    return () => {
      unsubscribeUserJoined();
      unsubscribeResponse();
    };
  }, [on]);

  const handleNextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      const newIndex = currentSlideIndex + 1;
      setCurrentSlideIndex(newIndex);
      setResponses([]);
      emit('slide changed', slides[newIndex]);
    }
  };

  const handlePrevSlide = () => {
    if (currentSlideIndex > 0) {
      const newIndex = currentSlideIndex - 1;
      setCurrentSlideIndex(newIndex);
      setResponses([]);
      emit('slide changed', slides[newIndex]);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const currentSlide = slides[currentSlideIndex];
  const slideResponses = responses.filter(
    (r) => r.slideId === currentSlide?.id
  );

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
      <div style={{ marginTop: '2rem', border: '1px solid #ccc', padding: '2rem' }}>
        {currentSlide ? (
          <div>
            <h2>{currentSlide.content}</h2>
            {currentSlide.type === 'mc' && (
              <ul>
                {currentSlide.choices?.map((choice) => (
                  <li key={choice.id}>
                    {choice.text} (
                    {slideResponses.filter((r) => r.payload.choice === choice.id).length})
                  </li>
                ))}
              </ul>
            )}
            {currentSlide.type === 'open' && (
              <ul>
                {slideResponses.map((r) => (
                  <li key={r.id}>{r.payload.text}</li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <p>No slides in this presentation.</p>
        )}
      </div>
      <div style={{ marginTop: '2rem' }}>
        <button onClick={handlePrevSlide} disabled={currentSlideIndex === 0}>
          Previous
        </button>
        <button onClick={handleNextSlide} disabled={currentSlideIndex === slides.length - 1}>
          Next
        </button>
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