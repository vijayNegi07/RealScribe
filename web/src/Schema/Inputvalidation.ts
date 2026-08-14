import z from "zod";

export const usernameValidation = z
    .string()
    .min(3,"Usermae must be atleast 3 characters")
    .max(20, "Username must not be more than 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/,"Special characters are not alolwed")

export const signUpValidation = z.object({
    username:usernameValidation,
    email:z.email({message:"Invalid email address"}),
    password:z.string().min(6,"Passoword should be atleast 6 characters")
})

export const sigInValidation = z.object({
    email:z.email(),
    password:z.string().min(6,"Passoword should be atleast 6 characters")
})

export const verifyCodeValidation = z.string().length(6,"Code must be 6 characters").regex(/^\d+$/, "OTP must contain only digits");

export const acceptMessageValidation = z.boolean();

export const messageValidation = z
    .string()
    .min(10, "Must be 10 characters atleast")
    .max(300, "Must be under 300 characters");

