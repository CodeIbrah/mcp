import { ZodError, type ZodType } from "zod";
import { ValidationError } from "../utils/errors";

/**
 * Validate an unknown input against a Zod schema.
 * Throws ValidationError with a clear message if validation fails.
 */
export function validateInput<T>(schema: ZodType<T, any, any>, input: unknown, toolName: string): T {
  try {
    return schema.parse(input);
  } catch (err) {
    if (err instanceof ZodError) {
      const details = err.issues
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ");
      throw new ValidationError(`Invalid input for ${toolName}: ${details}`, toolName);
    }
    throw err;
  }
}
