import joi from 'joi';

//회원가입 스키마
const signupSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).required(),
  verifyPassword: joi.string().required(),
  name: joi.string().required(),
  role: joi.string(),
});

const joiSchemas = {
  signupSchema,
};

export default joiSchemas;
