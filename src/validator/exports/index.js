import InvariantError from "../../exceptions/InvariantError.js";
import ExportNotesPayloadSchema from "./schema.js";

const ExportsValidator = {
  validateExportNotesPayload: (payload) => {
    const validationResult = ExportNotesPayloadSchema.validate(payload);
 
    if (validationResult.error) {
      throw new InvariantError(validationResult.error.message);
    }
  },
};

export default ExportsValidator;
