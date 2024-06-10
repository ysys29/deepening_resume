import joi from 'joi';

const schema = joi.object({
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

export const signUpValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
