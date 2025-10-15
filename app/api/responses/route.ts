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