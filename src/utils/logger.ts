import signale, { Signale } from "signale";

type LogEntry = MessageLog | string | number | boolean | object;

interface MessageLog {
  message: string | object | number | boolean;
  important?: boolean;
}

interface TableLog {
  message: string;
  data: unknown;
  properties?: string[];
  important?: boolean;
  level?: "log" | "error" | "success" | "await" | "fatal";
}

interface InteractiveLogEntry extends MessageLog {
  order?: { limit?: number; current: number };
  level: "log" | "error" | "success" | "await" | "fatal";
}

export class Logger {
  scope?: string;

  private logger: signale.Signale<signale.DefaultMethods>;
  private interactiveLogger!: signale.Signale<signale.DefaultMethods>;

  static verbose: boolean = false;

  constructor(scope?: string) {
    this.scope = scope;
    this.logger = this.scope ? signale.scope(this.scope) : signale;
  }

  log = (log: LogEntry) => {
    const message = Logger.isShouldLog(log);
    message && this.logger.log(message);
  };

  error = (log: LogEntry) => {
    const message = Logger.isShouldLog(log);
    message && this.logger.error(message);
  };

  success = (log: LogEntry) => {
    const message = Logger.isShouldLog(log);
    message && this.logger.success(message);
  };

  await = (log: LogEntry) => {
    const message = Logger.isShouldLog(log);
    message && this.logger.error(message);
  };

  table = (log: TableLog) => {
    const message =
      log.level === "fatal" ? log.message : Logger.isShouldLog(log);
    if (message) {
      this.logger[log.level ?? "log"](message);
      console.table(log.data, log.properties);
    }
  };

  fatal = (log: Omit<LogEntry, "important">) => {
    const message = isString(log) ? log : (log as MessageLog).message;
    this.logger.fatal(message);
  };

  interactive = (log: InteractiveLogEntry) => {
    const level = log.level ?? "log";
    if (!Logger.isShouldLog(log) && level != "fatal") {
      return;
    }
    if (!this.interactiveLogger) {
      this.interactiveLogger = new Signale({
        interactive: true,
        scope: this.scope,
      });
    }
    this.interactiveLogger[level](this.formatInteractiveMessage(log));
  };

  private formatInteractiveMessage = (log: InteractiveLogEntry) => {
    return log.order
      ? log.order.limit
        ? `[${log.order.current}/${log.order.limit}] - ${log.message}`
        : `[${log.order.current}] - ${log.message}`
      : log.message;
  };

  private static isShouldLog = (log: LogEntry) => {
    if (isPrimitive(log)) {
      return this.verbose ? log : null;
    }
    return (log as MessageLog).important || this.verbose
      ? (log as MessageLog).message
      : null;
  };
}

function isPrimitive(x: unknown) {
  return (
    isString(x) ||
    isBoolean(x) ||
    isNumber(x) ||
    (x as MessageLog).message == null
  );
}

function isString(x: unknown) {
  return Object.prototype.toString.call(x) === "[object String]";
}

function isBoolean(x: unknown) {
  return (
    x === true ||
    x === false ||
    Object.prototype.toString.call(x) === "[object Boolean]"
  );
}

function isNumber(x: unknown) {
  return (
    typeof x == "number" ||
    Object.prototype.toString.call(x) === "[object Number]"
  );
}
