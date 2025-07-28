import { randomBytes } from "crypto";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "server/config";
import { CustomTokenExpiredError, InvalidTokenError } from "server/utils/errors";

type Payload = Omit<JwtPayload, "iss" | "sub" | "iat" | "exp">;

export const generateJWT = (userId: string, expiresIn: number) => {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expiresIn;
    const token = jwt.sign(
        {
            iss: config.jwt.issuer,
            sub: userId,
            iat: issuedAt,
            exp: expiresAt,
        },
        config.jwt.secret,
        {
            algorithm: "HS256",
        },
    );

    return token;
};

export const validateJWT = (token: string) => {
    try {
        const payload = jwt.verify(token, config.jwt.secret) as Payload;
        return payload;
    } catch (e: any) {
       if (e.name === "TokenExpiredError") {
           throw new CustomTokenExpiredError()
       } else if (e.name === "JsonWebTokenError") {
           throw new InvalidTokenError()
       } else {
           throw new InvalidTokenError()
       }
    }
};

export const generateRefreshToken = () => {
    const token = randomBytes(32).toString("hex")        
    return token
}
