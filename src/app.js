import express from 'express';
import UsersRouter from './routes/users.router.js';
import ResumesRouter from './routes/resumes.router.js';
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';

const app = express();
const PORT = 3018;

app.use(express.json());

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Hello, resume_hub!' });
});

app.use('/', [UsersRouter, ResumesRouter]);
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`${PORT}번 포트로 서버가 열렸어요!`);
});
