import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { parse as parseCookie } from 'cookie';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const secret = process.env.JWT_SECRET || 'your-secret-key';

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true);
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: 'http://localhost:3000',
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const cookie = socket.handshake.headers.cookie;
    if (!cookie) {
      return next(new Error('Authentication error'));
    }
    const cookies = parseCookie(cookie);
    const token = cookies.token;

    if (!token) {
      return next(new Error('Authentication error'));
    }
    jwt.verify(token, secret, (err: any, decoded: any) => {
      if (err) {
        return next(new Error('Authentication error'));
      }
      socket.data.userId = decoded.userId;
      next();
    });
  });

  io.on('connection', (socket) => {
    console.log('A user connected:', socket.id, 'with userId:', socket.data.userId);

    socket.on('join', (sessionId: string) => {
      console.log(`User ${socket.id} is joining session ${sessionId}`);
      socket.join(sessionId);
      io.to(sessionId).emit('user joined', socket.id);
    });

    socket.on('slide changed', (slide: any) => {
      const room = Array.from(socket.rooms)[1];
      if (room) {
        io.to(room).emit('slide changed', slide);
      }
    });

    socket.on('response', (response: any) => {
      const room = Array.from(socket.rooms)[1];
      if (room) {
        io.to(room).emit('response', response);
        if (response.score > 0) {
          io.to(room).emit('leaderboard updated');
        }
      }
    });

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});