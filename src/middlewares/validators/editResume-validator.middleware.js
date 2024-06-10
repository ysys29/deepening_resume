import joi from 'joi';

const schema = joi
  .object({
    title: joi.string(),
    content: joi
      .string()
      .min(150)
      .messages({ 'string.min': '자기소개는 150자 이상 작성해야 합니다.' }),
  })
  .min(1)
  .message({ 'object.min': '수정할 내용을 입력해 주세요.' });

export const editResumeValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
