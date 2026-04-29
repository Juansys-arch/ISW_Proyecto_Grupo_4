"use strict";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

const _filename = fileURLToPath(import.meta.url);

const _dirname = path.dirname(_filename);

const srcEnvFilePath = path.resolve(_dirname, "../.env");
const rootEnvFilePath = path.resolve(_dirname, "../../.env");
const envFilePath = fs.existsSync(srcEnvFilePath) ? srcEnvFilePath : rootEnvFilePath;

dotenv.config({ path: envFilePath });

// Helper to safely read env vars with trim and fallback
const readEnv = (key, fallback = "") => {
  const value = process.env[key];
  if (typeof value === "string") return value.trim();
  return fallback;
};

export const PORT = parseInt(readEnv("PORT", "3000"), 10);
export const HOST = readEnv("HOST", "localhost");
export const DB_USERNAME = readEnv("DB_USERNAME", "ale");
export const PASSWORD = readEnv("PASSWORD", "12345");
export const DATABASE = readEnv("DATABASE", "techo");
export const DATABASE_URL = readEnv("DATABASE_URL", "postgresql://postgres:1213@localhost:5433/techo?schema=public");
export const ACCESS_TOKEN_SECRET = readEnv("ACCESS_TOKEN_SECRET", "dev-access-token-secret");
export const JWT_SECRET = readEnv("JWT_SECRET", ACCESS_TOKEN_SECRET);
export const cookieKey = readEnv("cookieKey", "dev-cookie-key");

export const config = {
  PORT,
  HOST,
  DB_USERNAME,
  PASSWORD,
  DATABASE,
  DATABASE_URL,
  ACCESS_TOKEN_SECRET,
  JWT_SECRET,
  cookieKey
};