import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { withAuth } from '../../../lib/auth-middleware';

export const GET = withAuth(async (req, userId) => {
  try {
    const presentations = await db.presentation.findMany({ where: { createdBy: userId } });
    return NextResponse.json(presentations);
  } catch (error) {
    console.error('Failed to fetch presentations:', error);
    return NextResponse.json(
      {
        message: 'Failed to fetch presentations.',
        error: error instanceof Error ? error.message : 'An unknown error occurred.',
      },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req, userId) => {
  try {
    const { title } = await req.json();
    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const presentation = await db.presentation.create({
      data: {
        title,
        createdBy: userId,
      },
    });

    return NextResponse.json(presentation, { status: 201 });
  } catch (error) {
    console.error('Failed to create presentation:', error);
    return NextResponse.json(
      {
        message: 'Failed to create presentation.',
        error: error instanceof Error ? error.message : 'An unknown error occurred.',
      },
      { status: 500 }
    );
  }
});