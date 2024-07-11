import Joi from "joi";

/**
 * @dev validates that input has minimum eight characters,
 * at least one uppercase letter, one lowercase letter, one number and one special character
 * @param input input string
 * @returns input string
 */
export const validateMKey = (input: string) => {
  Joi.attempt(
    input,
    Joi.string().pattern(new RegExp("^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-.]).{8,}$")).required(),
    "minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character",
  );
  return input;
};

export const validatePositiveNumber = (input: string) => {
  Joi.attempt(Number(input), Joi.number().greater(0).required(), "positive number required");
  return Number(input);
};
