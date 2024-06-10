import {
  ACCESS_TOKEN_SECRET_KEY,
  REFRESH_TOKEN_SECRET_KEY,
} from '../constants/env.constant.js';

export default function () {
  if (!ACCESS_TOKEN_SECRET_KEY || !REFRESH_TOKEN_SECRET_KEY) {
    console.error('환경 변수를 불러오지 못했습니다.');
    process.exit(1);
  }
}
