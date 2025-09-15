export const messages = {
    platform: {
        general: {
            invalidArgument:
                "There was a problem with the data you entered. \nPlease check if everything is correct and try again.",
            unexpectedError:
                "An unexpected error occurred. \nPlease try again.",
            rateLimitExceeded: "Please wait a moment before trying again.",
        },
        email: {
            required: "Email is required",
            invalid:
                "The email address you entered looks invalid. \nPlease try again.",
        },
        otp: {
            required: "Verification code is required.",
            invalid: "The verification code must be 6 characters long.",
            sessionExpired: "Your session has expired. \nPlease sign in again.",
            invalidToken:
                "Code not recognized. Try again or request a new code.",
        },
        name: {
            required: "Name is required",
            invalid: "Name must be at least 2 characters long",
        },
        session: {
            notFound: "No user session found. Please sign in again.",
        },
    },
};
