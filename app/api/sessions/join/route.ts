import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (typeof code !== 'string') {
      return NextResponse.json({ message: 'Join code is required' }, { status: 400 });
    }

    const session = await db.session.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!session || !session.active) {
      return NextResponse.json(
        { message: 'Session not found or is not active' },
        { status: 404 }
      );
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('Failed to join session:', error);
    return NextResponse.json(
      {
        message: 'Failed to join session.',
        error: error instanceof Error ? error.message : 'An unknown error occurred.',
      },
      { status: 500 }
    );
  }
}