import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { withAuth } from '../../../../../lib/auth-middleware';

// GET all slides for a presentation
export const GET = withAuth(async (req, userId, params) => {
  const presentationId = params.id as string;
  try {
    const presentation = await db.presentation.findFirst({
      where: { id: presentationId, createdBy: userId },
    });

    if (!presentation) {
      return NextResponse.json(
        { message: 'Presentation not found or access denied' },
        { status: 404 }
      );
    }

    const slides = await db.slide.findMany({
      where: { presentationId },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json(slides);
  } catch (error) {
    console.error('Failed to fetch slides:', error);
    return NextResponse.json(
      { message: 'Failed to fetch slides' },
      { status: 500 }
    );
  }
});

// POST a new slide to a presentation
export const POST = withAuth(async (req, userId, params) => {
  const presentationId = params.id as string;
  try {
    const presentation = await db.presentation.findFirst({
      where: { id: presentationId, createdBy: userId },
    });

    if (!presentation) {
      return NextResponse.json(
        { message: 'Presentation not found or access denied' },
        { status: 404 }
      );
    }

    const { type, content, choices } = await req.json();

    const lastSlide = await db.slide.findFirst({
      where: { presentationId },
      orderBy: { order: 'desc' },
    });

    const newOrder = lastSlide ? lastSlide.order + 1 : 0;

    const newSlide = await db.slide.create({
      data: {
        presentationId,
        type,
        content,
        choices: choices || {},
        order: newOrder,
      },
    });

    return NextResponse.json(newSlide, { status: 201 });
  } catch (error) {
    console.error('Failed to create slide:', error);
    return NextResponse.json(
      { message: 'Failed to create slide' },
      { status: 500 }
    );
  }
});