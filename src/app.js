import express from 'express';
import UsersRouter from './routes/users.router.js';
import cookieParser from 'cookie-parser';
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';

const app = express();
const PORT = 3018;

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  return res.status(200).json({ message: '안ㄴ녕' });
});

app.use('/', [UsersRouter]);
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`${PORT}번 포트로 서버가 열렸어요!`);
});
