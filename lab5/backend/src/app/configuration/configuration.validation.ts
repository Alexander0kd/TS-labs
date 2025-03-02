import * as Joi from 'joi';

export const ConfigurationValidation = Joi.object({
    NODE_ENV: Joi.string().valid('dev', 'prod'),

    PORT: Joi.number().required(),
    ALLOWED_ORIGINS: Joi.string().required(),
});
