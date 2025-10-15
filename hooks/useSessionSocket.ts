import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export function useSessionSocket(sessionId: string, token: string) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!sessionId || !token) return;

    const socket = io('http://localhost:3001', {
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('Connected to socket server');
      setConnected(true);
      socket.emit('join', sessionId);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [sessionId, token]);

  const emit = (event: string, payload: any) => {
    socketRef.current?.emit(event, payload);
  };

  const on = (event: string, handler: (payload: any) => void) => {
    socketRef.current?.on(event, handler);
    return () => {
      socketRef.current?.off(event, handler);
    };
  };

  return { connected, emit, on };
}