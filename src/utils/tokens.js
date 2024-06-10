import jwt from 'jsonwebtoken';
import {
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
} from '../constants/env.constant.js';

//엑세스 토큰 발급 함수
export function createAccessToken(userId) {
  return jwt.sign({ userId }, ACCESS_TOKEN_SECRET_KEY, {
    expiresIn: '12h',
  });
}
//리프레시 토큰 발급 함수
export function createRefreshToken(userId) {
  return jwt.sign({ userId }, REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: '7d',
  });
}
