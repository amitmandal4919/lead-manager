import { SOURCES, STATUSES } from "./constants.js";

// Same rules as the backend (backend/src/validators/leadValidator.js).
const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const PHONE_CHARS_REGEX = /^\+?[0-9\s\-()]+$/;

export function validateLeadForm(form) {
  const errors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const phone = form.phone.trim();
  const company = form.company.trim();

  if (!name) errors.name = "Full name is required";
  else if (name.length < 2) errors.name = "Name must be at least 2 characters";
  else if (name.length > 100) errors.name = "Name must be 100 characters or less";

  if (!email) errors.email = "Email is required";
  else if (email.length > 254 || !EMAIL_REGEX.test(email)) errors.email = "Enter a valid email address";

  if (!phone) errors.phone = "Phone number is required";
  else {
    const digits = phone.replace(/\D/g, "");
    if (!PHONE_CHARS_REGEX.test(phone) || digits.length < 7 || digits.length > 15) {
      errors.phone = "Enter a valid phone number (7-15 digits, e.g. +91 98765 43210)";
    }
  }

  if (!company) errors.company = "Company name is required";
  else if (company.length > 100) errors.company = "Company name must be 100 characters or less";

  if (!SOURCES.includes(form.source)) errors.source = "Please choose a source";
  if (!STATUSES.includes(form.status)) errors.status = "Please choose a status";

  return errors;
}
