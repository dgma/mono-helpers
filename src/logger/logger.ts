import { format } from "logform";
import winston from "winston";

const devLogger = winston.createLogger({
  level: "debug",
  format: format.combine(
    format.colorize(),
    format.printf((info) => `[${info.label ?? "no-label"}] ${info.level}: ${info.message}`),
  ),
  transports: [new winston.transports.Console()],
});

const prodLogger = winston.createLogger({
  level: "info",
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.printf((info) => `${info.timestamp} [${info.label ?? "no-label"}] ${info.level}: ${info.message}`),
  ),
  transports: [new winston.transports.Console()],
});

export const logger = process.env.NODE_ENV === "production" ? prodLogger : devLogger;
