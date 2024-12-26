import winston from "winston";
import "winston-daily-rotate-file";

// 创建日志格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  })
);

// 创建按日期轮转的传输器
const fileRotateTransport = new winston.transports.DailyRotateFile({
  dirname: "../logs", // 日志文件存放目录
  filename: "app-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d", // 保留14天的日志
  maxSize: "20m", // 每个文件最大20MB
  zippedArchive: true, // 压缩旧日志文件
});

// 创建logger实例
const logger = winston.createLogger({
  level: "info",
  format: logFormat,
  transports: [
    fileRotateTransport,
    // 开发环境下同时输出到控制台
    ...(process.env.NODE_ENV !== "production"
      ? [new winston.transports.Console()]
      : []),
  ],
});

// 封装日志方法
export const loggerService = {
  info: (message) => logger.info(message),
  error: (message, error) => {
    if (error instanceof Error) {
      logger.error(`${message} - ${error.message}\nStack: ${error.stack}`);
    } else {
      logger.error(`${message} - ${JSON.stringify(error)}`);
    }
  },
  warn: (message) => logger.warn(message),
  debug: (message) => logger.debug(message),

  // 记录API访问日志
  access: (req, user = null) => {
    const message = `${req.method} ${req.path} - User: ${user?.username || "anonymous"} - IP: ${req.ip}`;
    logger.info(message);
  },

  // 记录API响应时间
  apiResponse: (req, responseTime) => {
    const message = `${req.method} ${req.path} completed in ${responseTime}ms`;
    logger.info(message);
  },
};

export default loggerService;
