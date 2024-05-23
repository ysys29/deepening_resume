export default function (err, req, res, next) {
  if (err.isJoi) {
    const errorMessage = err.details.map((detail) => {
      switch (err.message) {
        case '"email" is required':
          return '이메일을 입력해주세요.';
        case '"email" must be a valid email':
          return '이메일 형식이 올바르지 않습니다.';
        case '"password" is required':
          return '비밀번호를 입력해 주세요';
        case '"password" length must be at least 6 characters long':
          return '비밀번호는 6자리 이상이어야 합니다.';
        case '"verifyPassword" is required':
          return '비밀번호 확인을 입력해 주세요.';
        case '"name" is required':
          return '이름을 입력해 주세요.';
        case '"title" is required':
          return '제목을 입력해 주세요.';
        case '"content" is required':
          return '자기소개를 입력해 주세요.';
        case '"content" length must be at least 150 characters long':
          return '자기소개는 150자 이상 작성해야 합니다.';
        case '"status" is required':
          return '변경하고자 하는 지원 상태를 입력해 주세요.';
        case '"reason" is required':
          return '지원 상태 변경 사유를 입력해 주세요';
        default:
          return err.message;
      }
    });

    return res.status(400).json({ errorMessage: errorMessage });
  }

  if (err.code === 'P2002') {
    return res.status(400).json({ errorMessage: '이미 가입 된 사용자입니다.' });
  }
  res.status(500).json({
    errorMessage:
      err.message ??
      '예상치 못한 에러가 발생했습니다. 관리자에게 문의해 주세요.',
  });
}
