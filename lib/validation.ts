import Joi from 'joi';

export const userRegistrationSchema = Joi.object({
  callsign: Joi.string()
    .pattern(/^[A-Z0-9]{1,3}[0-9][A-Z0-9]{0,3}[A-Z]$/)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid amateur radio callsign'
    }),
  email: Joi.string()
    .email()
    .required(),
  password: Joi.string()
    .min(8)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long'
    }),
  firstName: Joi.string()
    .min(1)
    .max(50)
    .required(),
  lastName: Joi.string()
    .min(1)
    .max(50)
    .required()
});

export const userLoginSchema = Joi.object({
  callsign: Joi.string()
    .required(),
  password: Joi.string()
    .required()
});

export const photoUploadSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(100)
    .required(),
  description: Joi.string()
    .max(500)
    .optional()
    .allow(''),
  tags: Joi.array()
    .items(Joi.string().max(30))
    .max(10)
    .default([]),
  isPublic: Joi.boolean()
    .default(true)
});

export const iframeConfigSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(50)
    .required(),
  photoIds: Joi.array()
    .items(Joi.string())
    .min(1)
    .max(20)
    .required(),
  settings: Joi.object({
    width: Joi.number()
      .min(300)
      .max(1200)
      .default(600),
    height: Joi.number()
      .min(200)
      .max(800)
      .default(400),
    autoPlay: Joi.boolean()
      .default(true),
    interval: Joi.number()
      .min(1000)
      .max(10000)
      .default(5000),
    showTitles: Joi.boolean()
      .default(true),
    showControls: Joi.boolean()
      .default(true),
    borderRadius: Joi.number()
      .min(0)
      .max(20)
      .default(8),
    backgroundColor: Joi.string()
      .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .default('#1e1e1e')
  }).required(),
  isPublic: Joi.boolean()
    .default(false)
});
