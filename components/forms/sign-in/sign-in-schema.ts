import { z } from "zod";

export const signInSchema = z.object({
    email: z.email({ message: "Invalid email address" }),
});

export type SignInSchema = z.infer<typeof signInSchema>;
