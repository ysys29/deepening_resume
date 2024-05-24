import joi from 'joi';

//회원가입 스키마
const signupSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  verifyPassword: joi.string().required(),
  name: joi.string().required(),
});

//로그인 스키마
const signinSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

//이력서 생성 스키마
const postSchema = joi.object({
  title: joi.string().required(),
  content: joi.string().min(150).required(),
});

//이력서 수정 스키마
const editSchema = joi.object({
  content: joi.string().min(150),
});

//이력서 상태 변경 스키마
const statusEdit = joi.object({
  status: joi
    .string()
    .uppercase()
    .required()
    .valid('APPLY', 'DROP', 'PASS', 'INTERVIEW1', 'INTERVIEW2', 'FINAL_PASS'),
  reason: joi.string().required(),
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
