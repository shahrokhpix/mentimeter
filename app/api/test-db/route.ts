import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';

export async function GET() {
  try {
    const userCount = await db.user.count();
    return NextResponse.json({
      message: 'Database connection successful.',
      userCount: userCount,
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        message: 'Database connection failed.',
        error: error instanceof Error ? error.message : 'An unknown error occurred.',
      },
      { status: 500 }
    );
  }
}