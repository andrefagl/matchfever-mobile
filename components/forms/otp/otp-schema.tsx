import { messages } from "@/constants";
import { z } from "zod";

export const otpSchema = z.object({
    code: z
        .string()
        .min(1, { message: messages.platform.otp.required })
        .length(6, { message: messages.platform.otp.invalid }),
});

export type OtpSchema = z.infer<typeof otpSchema>;
