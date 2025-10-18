import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }
    const token = jwt.sign({ userId: user.id }, secret, {
      expiresIn: '1h',
    });

    const cookie = serialize('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 3600,
      path: '/',
    });

    const response = NextResponse.json({ message: 'Login successful' });
    response.headers.set('Set-Cookie', cookie);
    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      {
        message: 'An unexpected error occurred.',
        error: error instanceof Error ? error.message : 'An unknown error occurred.',
      },
      { status: 500 }
    );
  }
}