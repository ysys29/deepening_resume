# 이력서 관리 사이트

이력서 관리를 위한 api 코드

## 기능

- 회원가입 및 로그인, 로그아웃
- 이력서 작성, 수정, 삭제
- 이력서 목록 조회, 상세 조회 (APPLICANT, RECRUITER 별 접근 권한)
- 이력서 상태 변경 및 로그 조회 (RECRUITER 전용)
- JWT와 header 기반 인증 및 엑세스, 리프레시 토큰 발급
- 가입 시 비밀번호, 리프레시 토큰 발급 시 토큰 값 해싱하여 저장

## 구조
- test: 테스트 파일
- src
  - constants: http 상태 코드 등 상수 폴더
  - middlewares: 조이 미들웨어 등 미들웨어 함수
  - routes: API 경로
  - controllers: API 컨트롤러
  - service: API 비즈니스 로직 처리
  - repository: 데이터베이스 상호작용
- prisma: 데이터베이스 설정
