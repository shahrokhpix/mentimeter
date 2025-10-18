'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

type Slide = {
  id: string;
  type: 'mc' | 'open' | 'quiz' | 'ranking' | 'scale';
  content: string;
  choices?: { id: string; text: string }[];
  correctAnswer?: string;
};

const SlideEditorPage = ({ params }: { params: { id: string } }) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [newSlideType, setNewSlideType] = useState<'mc' | 'open' | 'quiz' | 'ranking' | 'scale'>('mc');
  const [newSlideContent, setNewSlideContent] = useState('');
  const [newSlideChoices, setNewSlideChoices] = useState('');
  const [newSlideCorrectAnswer, setNewSlideCorrectAnswer] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch(`/api/presentations/${params.id}/slides`);
        if (response.ok) {
          const data = await response.json();
          setSlides(data);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch slides:', error);
        router.push('/login');
      }
    };
    fetchSlides();
  }, [params.id, router]);

  const handleCreateSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const choices =
        newSlideType === 'mc' || newSlideType === 'quiz' || newSlideType === 'ranking'
          ? newSlideChoices.split(',').map((c, i) => ({ id: `${i}`, text: c.trim() }))
          : undefined;

      const response = await fetch(`/api/presentations/${params.id}/slides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: newSlideType,
          content: newSlideContent,
          choices,
          correctAnswer: newSlideCorrectAnswer,
        }),
      });

      if (response.ok) {
        const newSlide = await response.json();
        setSlides([...slides, newSlide]);
        setNewSlideContent('');
        setNewSlideChoices('');
        setNewSlideCorrectAnswer('');
      } else {
        console.error('Failed to create slide');
      }
    } catch (error) {
      console.error('Failed to create slide:', error);
    }
  };

  return (
    <div className={styles.container}>
      <h1>Edit Presentation {params.id}</h1>
      <div style={{ marginTop: '2rem' }}>
        <h2>Slides</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {slides.map((slide) => (
            <li key={slide.id} className={styles.listItem}>
              <p>
                <strong>Type:</strong> {slide.type}
              </p>
              <p>
                <strong>Content:</strong> {slide.content}
              </p>
              {slide.choices && (
                <p>
                  <strong>Choices:</strong> {slide.choices.map((c) => c.text).join(', ')}
                </p>
              )}
              {slide.correctAnswer && (
                <p>
                  <strong>Correct Answer:</strong> {slide.correctAnswer}
                </p>
              )}
            </li>
          ))}
        </ul>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <h2>Create New Slide</h2>
        <form onSubmit={handleCreateSlide}>
          <div>
            <label>Type:</label>
            <select
              value={newSlideType}
              onChange={(e) => setNewSlideType(e.target.value as 'mc' | 'open' | 'quiz' | 'ranking' | 'scale')}
            >
              <option value="mc">Multiple Choice</option>
              <option value="open">Open Text</option>
              <option value="quiz">Quiz</option>
              <option value="ranking">Ranking</option>
              <option value="scale">Scale</option>
            </select>
          </div>
          <div style={{ margin: '1rem 0' }}>
            <label>Content:</label>
            <input
              type="text"
              value={newSlideContent}
              onChange={(e) => setNewSlideContent(e.target.value)}
              className={styles.input}
            />
          </div>
          {(newSlideType === 'mc' || newSlideType === 'quiz' || newSlideType === 'ranking') && (
            <div style={{ margin: '1rem 0' }}>
              <label>Choices (comma-separated):</label>
              <input
                type="text"
                value={newSlideChoices}
                onChange={(e) => setNewSlideChoices(e.target.value)}
                className={styles.input}
              />
            </div>
          )}
          {newSlideType === 'quiz' && (
            <div style={{ margin: '1rem 0' }}>
              <label>Correct Answer (enter the choice text):</label>
              <input
                type="text"
                value={newSlideCorrectAnswer}
                onChange={(e) => setNewSlideCorrectAnswer(e.target.value)}
                className={styles.input}
              />
            </div>
          )}
          <button type="submit" className={styles.button}>
            Create Slide
          </button>
        </form>
      </div>
    </div>
  );
};

export default SlideEditorPage;