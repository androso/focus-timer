import dotenv from "dotenv";

dotenv.config();

type Config = {
    db: DBConfig,
    jwt: JWTConfig
}

type DBConfig = {
    url: string,
    authToken: string
}

type JWTConfig = {
    secret: string,
    defaultDuration: number,
    issuer: string
}

const getEnvOrThrow = (key: string) => {
    if (!process.env[key]) {
       const message = `No value found for: ${key}`
       throw new Error(message)
    } 
    
    return process.env[key]
}

export const config: Config = {
    db: {
        url: getEnvOrThrow("TURSO_DATABASE_URL"),
        authToken: getEnvOrThrow("TURSO_AUTH_TOKEN")
    },
    jwt: {
        secret: getEnvOrThrow("JWT_SECRET"),
        defaultDuration: 60 * 60,
        issuer: getEnvOrThrow("JWT_ISSUER")
    }
}