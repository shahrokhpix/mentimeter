import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { nanoid } from 'nanoid';
import { withAuth } from '../../../../../lib/auth-middleware';

export const POST = withAuth(async (req, userId, params) => {
  const presentationId = params.id as string;

  if (typeof presentationId !== 'string') {
    return NextResponse.json({ message: 'Invalid presentation ID' }, { status: 400 });
  }

  try {
    const presentation = await db.presentation.findUnique({
      where: { id: presentationId },
    });

    if (!presentation || presentation.createdBy !== userId) {
      return NextResponse.json(
        { message: 'Presentation not found or access denied' },
        { status: 404 }
      );
    }

    const session = await db.session.create({
      data: {
        presentationId,
        presenterId: userId,
        code: nanoid(6).toUpperCase(),
        startedAt: new Date(),
        active: true,
      },
    });

    return NextResponse.json(session, { status: 201 });
  } catch (error) {
    console.error('Failed to start session:', error);
    return NextResponse.json(
      {
        message: 'Failed to start session.',
        error: error instanceof Error ? error.message : 'An unknown error occurred.',
      },
      { status: 500 }
    );
  }
});