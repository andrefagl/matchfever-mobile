import { messages } from "@/constants";
import { z } from "zod";

export const signInSchema = z.object({
    email: z.email({
        message: messages.platform.email.invalid,
    }),
});

export type SignInSchema = z.infer<typeof signInSchema>;
