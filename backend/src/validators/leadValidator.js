import { SOURCES, STATUSES } from "../config/constants.js";

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
const PHONE_CHARS_REGEX = /^\+?[0-9\s\-()]+$/;

const toText = (value) => (value === undefined || value === null ? "" : String(value).trim());

/**
 * Validates and cleans a lead payload.
 * Returns { errors, values }. If `errors` is empty the data is safe to save.
 * `isUpdate` makes `status` required (on create it defaults to "New").
 */
export function validateLeadData(body, { isUpdate = false } = {}) {
  const input = body && typeof body === "object" && !Array.isArray(body) ? body : {};
  const errors = {};

  const name = toText(input.name);
  const email = toText(input.email).toLowerCase();
  const phone = toText(input.phone);
  const company = toText(input.company);
  const source = toText(input.source);
  let status = toText(input.status);

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

  if (!source) errors.source = "Source is required";
  else if (!SOURCES.includes(source)) errors.source = `Source must be one of: ${SOURCES.join(", ")}`;

  if (!status && !isUpdate) status = "New";
  if (!status) errors.status = "Status is required";
  else if (!STATUSES.includes(status)) errors.status = `Status must be one of: ${STATUSES.join(", ")}`;

  return { errors, values: { name, email, phone, company, source, status } };
}
