import { refreshTokens } from "@shared/schema";
import { and, eq, gt } from "drizzle-orm";
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

    static async validateRefreshToken(refreshToken: string) {
        const [result] = await db
            .select()
            .from(refreshTokens)
            .where(
                and(
                    eq(refreshTokens.token, refreshToken),
                    eq(refreshTokens.isRevoked, false),
                    gt(refreshTokens.expiresAt, new Date()),
                )
            ).limit(1);
        
        return result 
    }
    
    static async revokeRefreshToken(token: string) {
        await db
            .update(refreshTokens)
            .set({ isRevoked: true })
            .where(eq(refreshTokens.token, token))
    }
}
