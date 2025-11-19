const { z, ZodError } = require("zod");

const baseServiceFields = {
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(200, "Name is too long"),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .max(300, "Address is too long"),
  city: z
    .string()
    .min(2, "City must be at least 2 characters")
    .max(100, "City is too long"),
  category: z.string().max(100, "Category is too long").optional().nullable(),
  phone: z.string().max(50, "Phone is too long").optional().nullable(),
  website: z.string().max(300, "Website is too long").optional().nullable(),

  postalCode: z
    .string()
    .max(20, "Postal code is too long")
    .optional()
    .nullable(),
};

// For creating a service: required base fields
const serviceCreateSchema = z.object({
  name: baseServiceFields.name,
  address: baseServiceFields.address,
  city: baseServiceFields.city,
  category: baseServiceFields.category,
  phone: baseServiceFields.phone,
  website: baseServiceFields.website,
  postalCode: baseServiceFields.postalCode,
});

// For updating a service: all optional, but if present must be valid
const serviceUpdateSchema = z.object({
  name: baseServiceFields.name.optional(),
  address: baseServiceFields.address.optional(),
  city: baseServiceFields.city.optional(),
  category: baseServiceFields.category,
  phone: baseServiceFields.phone,
  website: baseServiceFields.website,
  postalCode: baseServiceFields.postalCode,
});

/**
 * Helper to format Zod errors into something clean.
 */
function formatZodError(error) {
  // ZodError uses .issues, not .errors
  if (!error || !Array.isArray(error.issues)) {
    return [];
  }

  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
}

module.exports = {
  serviceCreateSchema,
  serviceUpdateSchema,
  formatZodError,
  ZodError,
};
