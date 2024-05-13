import { Joi, Segments, celebrate } from "celebrate";

export default {
  getById: celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.string().uuid().required(),
    }),
  }),
};
