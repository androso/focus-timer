import { refreshTokens } from "@shared/schema";
import { db } from "server/config/database";
import { generateRefreshToken } from "server/services/jwt";

export class RefreshTokenModel {
    static async storeRefreshToken(userId: string) {
        const refreshToken = generateRefreshToken(); 
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        await db.insert(refreshTokens).values({
            token: refreshToken,
            expiresAt: expiresAt,
            userId: userId
        })
        
        return refreshToken
    }
}