import fs from 'fs';
import path from 'path';

const logsDir = path.join(__dirname, '../../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

interface LogData {
  [key: string]: any;
}

export class Logger {
  private authLogFile: string;
  private netLogFile: string;

  constructor() {
    const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
    this.authLogFile = path.join(logsDir, `AUTH_${timestamp}.log`);
    this.netLogFile = path.join(logsDir, `NET_${timestamp}.log`);
  }

  private writeLog(file: string, level: string, message: string, data?: LogData) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(file, logLine);
  }

  info(message: string, data?: LogData) {
    this.writeLog(this.authLogFile, 'INFO', message, data);
  }

  warn(message: string, data?: LogData) {
    this.writeLog(this.authLogFile, 'WARN', message, data);
  }

  error(message: string, data?: LogData) {
    this.writeLog(this.authLogFile, 'ERROR', message, data);
  }

  network(message: string, data?: LogData) {
    this.writeLog(this.netLogFile, 'NET', message, data);
  }
}

export const logger = new Logger();
