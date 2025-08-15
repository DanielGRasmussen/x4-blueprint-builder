export enum ErrorLevel {
	INFO = "info",
	WARNING = "warning",
	ERROR = "error"
}

export interface ErrorOptions {
	showAlert?: boolean;
	logToConsole?: boolean;
	level?: ErrorLevel;
}

export class ErrorHandler {
	static handle(message: string, error?: unknown, options?: ErrorOptions): void {
		const opts = {
			showAlert: true,
			logToConsole: true,
			level: ErrorLevel.ERROR,
			...options
		};

		const errorMessage = error instanceof Error ? error.message : String(error || "");
		const fullMessage = errorMessage ? `${message}: ${errorMessage}` : message;

		if (opts.logToConsole) {
			switch (opts.level) {
				case ErrorLevel.INFO:
					console.info(fullMessage, error);
					break;
				case ErrorLevel.WARNING:
					console.warn(fullMessage, error);
					break;
				case ErrorLevel.ERROR:
					console.error(fullMessage, error);
					break;
			}
		}

		if (opts.showAlert) {
			alert(fullMessage);
		}
	}

	static info(message: string, options?: Omit<ErrorOptions, "level">): void {
		this.handle(message, undefined, { ...options, level: ErrorLevel.INFO, showAlert: false });
	}

	static warning(message: string, error?: unknown, options?: Omit<ErrorOptions, "level">): void {
		this.handle(message, error, { ...options, level: ErrorLevel.WARNING });
	}

	static error(message: string, error?: unknown, options?: Omit<ErrorOptions, "level">): void {
		this.handle(message, error, { ...options, level: ErrorLevel.ERROR });
	}

	static silent(message: string, error?: unknown): void {
		this.handle(message, error, { showAlert: false, logToConsole: true });
	}
}
