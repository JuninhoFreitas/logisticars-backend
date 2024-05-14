import { Joi, Segments, celebrate } from "celebrate";

export default {
  getById: celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.string().uuid().required(),
    }),
  }),

  addNew: celebrate({
    [Segments.BODY]: Joi.object().keys({
      nome: Joi.string().max(250).required(),
      unidade_medida: Joi.string().max(30).required(),
      id_categoria: Joi.string().uuid().required(),
    }),
  }),

  edit: celebrate({
    [Segments.PARAMS]: Joi.object().keys({
      id: Joi.string().uuid().required(),
    }),
    [Segments.BODY]: Joi.object().keys({
      nome: Joi.string().max(250).required(),
    }),
  }),
  list: celebrate({
    [Segments.QUERY]: Joi.object().keys({
      page: Joi.number().integer().min(1),
      limit: Joi.number().integer().min(1),
    }),
  }),
};
