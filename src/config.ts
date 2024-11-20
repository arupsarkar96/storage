import * as dotenv from 'dotenv'
dotenv.config()


if (!process.env.PORT || !process.env.CONSOLE_PORT || !process.env.MYSQL || !process.env.SECRET_KEY || !process.env.ACCESS_KEY) {
    throw new Error("Missing required environment variables");
}

export interface ServerConfiguration {
    PORT: number,
    CONSOLE_PORT: number,
    MYSQL: string,
    DRIVES: string[],
    ACCESS_KEY: string,
    SECRET_KEY: string
}

const configuration: ServerConfiguration = {
    PORT: Number(process.env.PORT),
    CONSOLE_PORT: Number(process.env.CONSOLE_PORT),
    MYSQL: process.env.MYSQL,
    DRIVES: ["/mnt/disk1"],
    ACCESS_KEY: process.env.ACCESS_KEY,
    SECRET_KEY: process.env.SECRET_KEY,
}

export default configuration