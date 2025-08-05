import dotenv from "dotenv";

dotenv.config();

type Config = {
    db: DBConfig,
    jwt: JWTConfig,
    api: ApiConfig
}

type ApiConfig = {
    googleClientId: string,
    googleClientSecret: string,
    baseUrl: string,
    nodeEnv: string
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
        defaultDuration: 60,
        issuer: getEnvOrThrow("JWT_ISSUER")
    },
    api: {
        baseUrl: getEnvOrThrow("BASE_URL"),
        googleClientId: getEnvOrThrow("GOOGLE_CLIENT_ID"),
        googleClientSecret: getEnvOrThrow("GOOGLE_CLIENT_SECRET"),
        nodeEnv: getEnvOrThrow("NODE_ENV")
    }
}