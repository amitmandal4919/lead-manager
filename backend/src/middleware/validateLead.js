import { validateLeadData } from "../validators/leadValidator.js";

// Express middleware. Usage: router.post("/", validateLead(), ...) or validateLead({ isUpdate: true })
export default function validateLead(options = {}) {
  return (req, res, next) => {
    const { errors, values } = validateLeadData(req.body, options);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed. Please correct the highlighted fields.",
        errors,
      });
    }
    req.validatedLead = values; // cleaned + trimmed data
    next();
  };
}
