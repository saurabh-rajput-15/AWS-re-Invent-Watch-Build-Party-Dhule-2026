import util from 'util';

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
}

class LoggerService {
  private buffer: LogEntry[] = [];
  private maxEntries = 100;
  private installed = false;

  constructor() {
    this.installConsoleInterceptor();
  }

  private installConsoleInterceptor(): void {
    if (this.installed) return;
    this.installed = true;

    const origLog = console.log;
    const origWarn = console.warn;
    const origError = console.error;
    const origInfo = console.info;

    let isInternal = false;

    const record = (level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', args: any[]) => {
      if (isInternal) return;
      isInternal = true;
      try {
        const formatted = util.format(...args);
        const timestamp = new Date().toISOString();
        this.buffer.push({ timestamp, level, message: formatted });
        if (this.buffer.length > this.maxEntries) {
          this.buffer.shift();
        }
      } catch {
        // Safe fallback
      } finally {
        isInternal = false;
      }
    };

    console.log = (...args: any[]) => {
      record('INFO', args);
      origLog.apply(console, args);
    };

    console.info = (...args: any[]) => {
      record('INFO', args);
      origInfo.apply(console, args);
    };

    console.warn = (...args: any[]) => {
      record('WARN', args);
      origWarn.apply(console, args);
    };

    console.error = (...args: any[]) => {
      record('ERROR', args);
      origError.apply(console, args);
    };
  }

  /**
   * Retrieves the last N log entries with exact timestamp and level.
   */
  public getRecentLogs(count = 50): string[] {
    const slice = this.buffer.slice(-count);
    return slice.map((entry) => `[${entry.timestamp}] [${entry.level}] ${entry.message}`);
  }

  /**
   * Retrieves the last N log entries joined as a newline-delimited string.
   */
  public getRecentLogsFormatted(count = 50): string {
    const logs = this.getRecentLogs(count);
    return logs.length > 0 ? logs.join('\n') : `[${new Date().toISOString()}] [INFO] Logger initialized, waiting for events...`;
  }
}

export const loggerService = new LoggerService();
