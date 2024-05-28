import joi from 'joi';

//회원가입 스키마
const signupSchema = joi.object({
  email: joi.string().email().required().messages({
    'any.required': '이메일을 입력해주세요.',
    'string.email': '이메일 형식이 올바르지 않습니다.',
  }),
  password: joi.string().min(6).required().messages({
    'any.required': '비밀번호를 입력해 주세요.',
    'string.min': '비밀번호는 6자리 이상이어야 합니다.',
  }),
  verifyPassword: joi
    .string()
    .required()
    .messages({ 'any.required': '비밀번호 확인을 입력해 주세요.' }),
  name: joi
    .string()
    .required()
    .messages({ 'any.required': '이름을 입력해 주세요.' }),
});

//로그인 스키마
const signinSchema = joi.object({
  email: joi.string().email().required().messages({
    'any.required': '이메일을 입력해 주세요.',
    'string.email': '이메일 형식이 올바르지 않습니다.',
  }),
  password: joi
    .string()
    .required()
    .messages({ 'any.required': '비밀번호를 입력해 주세요.' }),
});

//이력서 생성 스키마
const postSchema = joi.object({
  title: joi
    .string()
    .required()
    .messages({ 'any.required': '제목을 입력해 주세요.' }),
  content: joi.string().min(150).required().messages({
    'any.required': '자기소개를 입력해 주세요.',
    'string.min': '자기소개는 150자 이상 작성해야 합니다.',
  }),
});

//이력서 수정 스키마
const editSchema = joi.object({
  content: joi
    .string()
    .min(150)
    .messages({ 'string.min': '자기소개는 150자 이상 작성해야 합니다.' }),
});

//이력서 상태 변경 스키마
const statusEdit = joi.object({
  status: joi
    .string()
    .uppercase()
    .required()
    .valid('APPLY', 'DROP', 'PASS', 'INTERVIEW1', 'INTERVIEW2', 'FINAL_PASS')
    .messages({
      'any.required': '변경하고자 하는 지원 상태를 입력해 주세요.',
      'any.only': '유효하지 않은 지원 상태입니다.',
    }),
  reason: joi
    .string()
    .required()
    .messages({ 'any.required': '변경 사유를 입력해 주세요.' }),
});

//스키마 내보내기
const joiSchemas = {
  signupSchema,
  signinSchema,
  postSchema,
  editSchema,
  statusEdit,
};

export default joiSchemas;
