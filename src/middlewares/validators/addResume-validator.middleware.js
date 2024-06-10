import joi from 'joi';

const schema = joi.object({
  title: joi
    .string()
    .required()
    .messages({ 'any.required': '제목을 입력해 주세요.' }),
  content: joi.string().min(150).required().messages({
    'any.required': '자기소개를 입력해 주세요.',
    'string.min': '자기소개는 150자 이상 작성해야 합니다.',
  }),
});

export const addResumeValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
