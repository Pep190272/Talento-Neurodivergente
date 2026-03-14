/**
 * Structured logger — thin wrapper over console for now.
 * Swap the transport (e.g. pino, winston) without touching call-sites.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const MIN_LEVEL: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ?? (process.env.NODE_ENV === 'production' ? 'warn' : 'debug')

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[MIN_LEVEL]
}

function format(level: LogLevel, tag: string, message: string, meta?: unknown): string {
  const ts = new Date().toISOString()
  const base = `${ts} [${level.toUpperCase()}] [${tag}] ${message}`
  return meta ? `${base} ${JSON.stringify(meta)}` : base
}

export const logger = {
  debug(tag: string, message: string, meta?: unknown) {
    if (shouldLog('debug')) console.debug(format('debug', tag, message, meta))
  },
  info(tag: string, message: string, meta?: unknown) {
    if (shouldLog('info')) console.info(format('info', tag, message, meta))
  },
  warn(tag: string, message: string, meta?: unknown) {
    if (shouldLog('warn')) console.warn(format('warn', tag, message, meta))
  },
  error(tag: string, message: string, meta?: unknown) {
    if (shouldLog('error')) console.error(format('error', tag, message, meta))
  },
}
