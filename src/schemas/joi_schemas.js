import joi from 'joi';

//회원가입 스키마
const signupSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  verifyPassword: joi.string().required(),
  name: joi.string().required(),
  role: joi.string(),
});

//로그인 스키마
const signinSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().required(),
});

//스키마 내보내기
const joiSchemas = {
  signupSchema,
  signinSchema,
};

export default joiSchemas;
