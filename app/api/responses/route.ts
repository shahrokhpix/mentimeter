import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { withAuth } from '../../../lib/auth-middleware';

export const POST = withAuth(async (req, userId) => {
  try {
    const { sessionId, slideId, payload } = await req.json();

    if (!sessionId || !slideId || !payload) {
      return NextResponse.json(
        { message: 'sessionId, slideId, and payload are required' },
        { status: 400 }
      );
    }

    const slide = await db.slide.findUnique({ where: { id: slideId } });
    if (!slide) {
      return NextResponse.json({ message: 'Slide not found' }, { status: 404 });
    }

    let score = 0;
    if (slide.type === 'quiz' && slide.correctAnswer) {
      const choice = (slide.choices as any[]).find(c => c.id === payload.choice);
      if (choice && choice.text === slide.correctAnswer) {
        score = 10; // Award 10 points for a correct answer
      }
    }

    if (score > 0) {
      const leaderboard = await db.leaderboard.findUnique({ where: { sessionId } });
      if (leaderboard) {
        const scores = leaderboard.scores as { [key: string]: number };
        scores[userId] = (scores[userId] || 0) + score;
        await db.leaderboard.update({
          where: { sessionId },
          data: { scores },
        });
      } else {
        await db.leaderboard.create({
          data: {
            sessionId,
            scores: { [userId]: score },
          },
        });
      }
    }

    const response = await db.response.create({
      data: {
        sessionId,
        slideId,
        deviceId: userId, // Using the userId as the deviceId for now
        payload,
      },
    });

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Failed to save response:', error);
    return NextResponse.json(
      { message: 'Failed to save response' },
      { status: 500 }
    );
  }
});