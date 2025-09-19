// See https://appwrite.io/docs/advanced/platform/error-handling for best practices on error handling
// See https://appwrite.io/docs/advanced/platform/response-codes#error-types for possible error types

import { messages } from "@/constants";

type ErrorMessageGenerator = (context?: string) => string;

const appwriteErrorMessages: {
    [key: string]: string | ErrorMessageGenerator;
} = {
    // Platform Errors
    general_argument_invalid: (context?: string) => {
        if (context === "email") {
            return messages.platform.email.invalid;
        }
        return messages.platform.general.invalidArgument;
    },
    user_invalid_token: messages.platform.otp.invalidToken,
    general_rate_limit_exceeded: messages.platform.general.rateLimitExceeded,
    default: messages.platform.general.unexpectedError,
};

/**
 * Returns a user-friendly error message based on the Appwrite error type.
 * Allows passing an optional context to customize the message.
 * If the error type is not found, it returns a generic message.
 * @param errorType The error type returned by AppwriteException (error.type).
 * @param context An optional string providing additional context (e.g., the field name).
 * @returns A string with the user-friendly message.
 */
export function getFriendlyErrorMessage(
    errorType: string,
    context?: string
): string {
    const handler =
        errorType in appwriteErrorMessages
            ? appwriteErrorMessages[errorType]
            : appwriteErrorMessages.default;

    if (typeof handler === "function") {
        return handler(context);
    } else if (typeof handler === "string") {
        return handler;
    }

    return messages.platform.general.unexpectedError;
}
