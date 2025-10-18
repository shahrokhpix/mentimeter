import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { withAuth } from '../../../../lib/auth-middleware';

export const GET = withAuth(async (req, userId, params) => {
  const sessionId = params.sessionId as string;
  try {
    const leaderboard = await db.leaderboard.findUnique({
      where: { sessionId },
    });

    if (!leaderboard) {
      return NextResponse.json({ scores: {} });
    }

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json(
      { message: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
});