import { Request } from "express";

export const extractAccessToken = (req: Request) => {
    // if client is a browser
    if (req.cookies && req.cookies.accessToken) {
        return req.cookies.accessToken;
    }

    // if it's not a browser
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }

    return null;
};

export const extractRefreshToken = (req: Request) => {
    // if client is browser
    if (req.cookies && req.cookies.refreshToken) {
        return req.cookies.refreshToken;
    }

    // if client is not browser
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
        return authHeader.substring(7);
    }
    return null;
};
