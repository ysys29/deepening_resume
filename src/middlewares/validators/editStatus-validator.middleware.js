import joi from 'joi';

const schema = joi.object({
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

export const editStatusValidator = async (req, res, next) => {
  try {
    await schema.validateAsync(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
