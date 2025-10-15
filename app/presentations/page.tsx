'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Presentation = {
  id: string;
  title: string;
  createdAt: string;
};

const PresentationsPage = () => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [newPresentationTitle, setNewPresentationTitle] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/presentations', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const data = await response.json();
          setPresentations(data);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Failed to fetch presentations:', error);
        router.push('/login');
      }
    };
    fetchPresentations();
  }, [router]);

  const handleCreatePresentation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPresentationTitle.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: newPresentationTitle }),
      });

      if (response.ok) {
        const newPresentation = await response.json();
        setPresentations([...presentations, newPresentation]);
        setNewPresentationTitle('');
      } else {
        console.error('Failed to create presentation');
      }
    } catch (error) {
      console.error('Failed to create presentation:', error);
    }
  };

  const handleStartPresentation = async (presentationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/presentations/${presentationId}/start`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const session = await response.json();
        router.push(`/presentations/${presentationId}/present?session_id=${session.id}&join_code=${session.code}`);
      } else {
        console.error('Failed to start presentation');
      }
    } catch (error) {
      console.error('Failed to start presentation:', error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>My Presentations</h1>
      <form onSubmit={handleCreatePresentation} style={{ margin: '2rem 0' }}>
        <input
          type="text"
          value={newPresentationTitle}
          onChange={(e) => setNewPresentationTitle(e.target.value)}
          placeholder="Enter new presentation title"
          style={{ padding: '0.5rem', marginRight: '1rem' }}
        />
        <button type="submit" style={{ padding: '0.5rem 1rem' }}>
          Create Presentation
        </button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {presentations.map((p) => (
          <li
            key={p.id}
            style={{
              padding: '1rem',
              border: '1px solid #ccc',
              marginBottom: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <span>{p.title}</span>
            <button
              onClick={() => handleStartPresentation(p.id)}
              style={{ padding: '0.5rem 1rem' }}
            >
              Present
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PresentationsPage;