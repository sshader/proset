import { Id } from '../_generated/dataModel'

// begin specific configuration for my app
export const LOG_TOPICS = {
  Game: 'GAME',
  User: 'USER',
} as const

export type LogTopicToMetadata = {
  GAME: {
    gameId: Id<'Games'>
    userId: Id<'Users'>
  }
  USER: {
    userId: Id<'Users'>
  }
}
// end specific configuration for my app

// Generic library for structured logging
type LoggerWithTopics<LogMetadataMap extends Record<string, any>> = {
  log: <K extends keyof LogMetadataMap>(
    kind: K,
    metadata: LogMetadataMap[K],
    message: string
  ) => void
  logVerbose: <K extends keyof LogMetadataMap>(
    kind: K,
    metadata: LogMetadataMap[K],
    message: string
  ) => void
}

type Logger<LogMetadataMap extends Record<string, any>> = {
  time: (label: string) => void
  timeVerbose: (label: string) => void
  timeLog: (label: string, message: string) => void
  timeLogVerbose: (label: string, message: string) => void
  timeEnd: (label: string) => void
  timeEndVerbose: (label: string) => void
} & LoggerWithTopics<LogMetadataMap>

/**
 * This supports type safe logging of structured messages, e.g.
 * ctx.logger.log(LOG_TOPICS.User, { userId: user._id }, "Created")
 *
 * This also supports verbose logging sampled per function execution by the `VERBOSE_LOG_FRACTION`
 * env variable, which can be overridden by setting `VERBOSE_LOG` to true.
 * @returns
 */
export function setupLogger(): Logger<LogTopicToMetadata> {
  const verboseLogFraction = parseFloat(process.env.VERBOSE_LOG_FRACTION ?? '0')
  const verboseLogOverride =
    process.env.VERBOSE_LOG === 'true' ? true : undefined
  const verbose =
    verboseLogOverride !== undefined
      ? verboseLogOverride
      : Math.random() < verboseLogFraction
  return {
    log: (kind, metadata, message) => {
      console.log(JSON.stringify({ topic: kind, metadata, message }))
    },
    logVerbose: (kind, metadata, message) => {
      if (verbose) {
        console.log(JSON.stringify({ topic: kind, metadata, message }))
      }
    },
    time: (label: string) => {
      console.time(label)
    },
    timeLog: (label: string, message: string) => {
      console.timeLog(label, message)
    },
    timeEnd: (label: string) => {
      console.timeEnd(label)
    },
    timeVerbose: (label: string) => {
      if (verbose) {
        console.time(label)
      }
    },
    timeEndVerbose: (label: string) => {
      if (verbose) {
        console.timeEnd(label)
      }
    },
    timeLogVerbose: (label: string, message: string) => {
      if (verbose) {
        console.timeLog(label, message)
      }
    },
  }
}
