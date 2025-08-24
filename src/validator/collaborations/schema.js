import Joi from "joi";

const CollaborationPayloadSchema = Joi.object({
  noteId: Joi.string().required(),
  userId: Joi.string().required(),
});

export default CollaborationPayloadSchema;