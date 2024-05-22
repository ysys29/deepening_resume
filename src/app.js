import express from 'express';
import errorHandlingMiddleware from './middlewares/error-handling.middleware';

const app = express();
const PORT = 3018;

app.get('/', (req, res) => {
  return res.status(200).json({ message: '안ㄴ녕' });
});

app.use('/', []);
app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(`${PORT}번 포트로 서버가 열렸어요!`);
});
