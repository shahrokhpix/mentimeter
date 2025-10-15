'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Slide = {
  id: string;
  type: 'mc' | 'open';
  content: string;
  choices?: { id: string; text: string }[];
};

const SlideEditorPage = ({ params }: { params: { id: string } }) => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [newSlideType, setNewSlideType] = useState<'mc' | 'open'>('mc');
  const [newSlideContent, setNewSlideContent] = useState('');
  const [newSlideChoices, setNewSlideChoices] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/presentations/${params.id}/slides`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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
      const token = localStorage.getItem('token');
      const choices =
        newSlideType === 'mc'
          ? newSlideChoices.split(',').map((c, i) => ({ id: `${i}`, text: c.trim() }))
          : undefined;

      const response = await fetch(`/api/presentations/${params.id}/slides`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: newSlideType,
          content: newSlideContent,
          choices,
        }),
      });

      if (response.ok) {
        const newSlide = await response.json();
        setSlides([...slides, newSlide]);
        setNewSlideContent('');
        setNewSlideChoices('');
      } else {
        console.error('Failed to create slide');
      }
    } catch (error) {
      console.error('Failed to create slide:', error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Edit Presentation {params.id}</h1>
      <div style={{ marginTop: '2rem' }}>
        <h2>Slides</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {slides.map((slide) => (
            <li key={slide.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
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
              onChange={(e) => setNewSlideType(e.target.value as 'mc' | 'open')}
            >
              <option value="mc">Multiple Choice</option>
              <option value="open">Open Text</option>
            </select>
          </div>
          <div style={{ margin: '1rem 0' }}>
            <label>Content:</label>
            <input
              type="text"
              value={newSlideContent}
              onChange={(e) => setNewSlideContent(e.target.value)}
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          {newSlideType === 'mc' && (
            <div style={{ margin: '1rem 0' }}>
              <label>Choices (comma-separated):</label>
              <input
                type="text"
                value={newSlideChoices}
                onChange={(e) => setNewSlideChoices(e.target.value)}
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
          )}
          <button type="submit" style={{ padding: '0.5rem 1rem' }}>
            Create Slide
          </button>
        </form>
      </div>
    </div>
  );
};

export default SlideEditorPage;