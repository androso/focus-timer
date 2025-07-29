import { type RequestHandler } from "express";
import { validateJWT } from "server/services/jwt";
import { extractAccessToken } from "server/utils/tokenExtractors";
import { UserModel } from "server/models/User";
import { CustomTokenExpiredError, InvalidTokenError } from "server/utils/errors";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const accessToken = extractAccessToken(req);
  if (accessToken) {
     try {
       const payload = validateJWT(accessToken);

       if (payload && payload.sub) {
        const user = await UserModel.getUser(payload.sub);
        if (user) {
          req.userId = payload.sub;
          req.user = user;
          return next();
        } 
       }
     } catch(e) {
       if (e instanceof CustomTokenExpiredError) {
         res.clearCookie("accessToken");
         res.status(401).json({
           message: "Access token expired",
           code: "TOKEN_EXPIRED"
         })
         return
       } else if (e instanceof InvalidTokenError) {
         res.clearCookie("accessToken");
         res.status(401).json({
           message: "Access token invalid",
           code: "INVALID_TOKEN"
         })
       }
       console.error("JWT validation error: ", e)
     }
  }

  res.status(401).json({ message: "Unauthorized" }); 
  return;
};
