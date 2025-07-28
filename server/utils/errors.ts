export class BadRequestError extends Error {
    constructor(message: string) {
        super(message)
    }
}

export class UserNotAuthorizedError extends Error {
    constructor(message: string) {
        super(message)
    }
}

export class ForbiddenRequestError extends Error {
    constructor(message: string) {
        super(message)
    }
}

export class NotFoundError extends Error {
    constructor(message: string) {
        super(message)
    }
}

export class CustomTokenExpiredError extends Error {
    constructor(message: string = "Token has expired") {
        super(message);
    }
}

export class InvalidTokenError extends Error {
    constructor(message: string = "Invalid token") {
        super(message)
    }
}