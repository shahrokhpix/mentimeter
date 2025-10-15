import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function withAuth(
  handler: (
    req: NextRequest,
    userId: string,
    params: { [key: string]: string | string[] }
  ) => Promise<NextResponse>
) {
  return async (
    req: NextRequest,
    { params }: { params: { [key: string]: string | string[] } }
  ) => {
    const token = req.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new Error('JWT_SECRET is not defined');
      }
      const decoded = jwt.verify(token, secret) as { userId: string };
      return handler(req, decoded.userId, params);
    } catch (error) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
  };
}