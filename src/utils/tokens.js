import jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
} from '../constants/env.constant';

//엑세스 토큰 발급 함수
export function createAccessToken(user_id) {
  return jwt.sign({ user_id }, ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: '12h',
  });
}
//리프레시 토큰 발급 함수
export function createRefreshToken(user_id) {
  return jwt.sign({ user_id }, REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: '7d',
  });
}
