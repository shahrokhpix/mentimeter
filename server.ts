import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

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
      origin: '*',
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
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

    socket.on('disconnect', () => {
      console.log('A user disconnected:', socket.id);
    });
  });

  const port = process.env.PORT || 3000;
  httpServer.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});