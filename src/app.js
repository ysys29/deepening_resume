import 'dotenv/config';
import express from 'express';
import UsersRouter from './routes/users.router.js';
import ResumesRouter from './routes/resumes.router.js';
import errorHandlingMiddleware from './middlewares/error-handling.middleware.js';
import { SERVER_PORT } from './constants/env.constant.js';
import checkEnv from './utils/checkEnv.js';
import { HTTP_STATUS } from './constants/http-status.constant.js';

const app = express();

checkEnv();

app.use(express.json());

app.get('/', (req, res) => {
  return res.status(HTTP_STATUS.OK).json({ message: 'Hello, resume_hub!' });
});

app.use('/', [UsersRouter, ResumesRouter]);
app.use(errorHandlingMiddleware);

app.listen(SERVER_PORT, () => {
  console.log(`${SERVER_PORT}번 포트로 서버가 열렸어요!`);
});
