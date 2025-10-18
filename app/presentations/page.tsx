'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './styles.module.css';

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
        const response = await fetch('/api/presentations');
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
      const response = await fetch('/api/presentations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch(`/api/presentations/${presentationId}/start`, {
        method: 'POST',
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
    <div className={styles.container}>
      <h1>My Presentations</h1>
      <form onSubmit={handleCreatePresentation} className={styles.form}>
        <input
          type="text"
          value={newPresentationTitle}
          onChange={(e) => setNewPresentationTitle(e.target.value)}
          placeholder="Enter new presentation title"
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          Create Presentation
        </button>
      </form>
      <ul className={styles.list}>
        {presentations.map((p) => (
          <li
            key={p.id}
            className={styles.listItem}
          >
            <span>{p.title}</span>
            <button
              onClick={() => handleStartPresentation(p.id)}
              className={styles.button}
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