/**
 * Recipe.Report API.
 * This is the 'main' script for the API application.
 * @author {@link https://github.com/jmg1138 jmg1138}
 */

import { RequestHandler } from 'express'
import * as BodyParser from 'body-parser'
import Helmet from 'helmet'
import HerokuSslRedirect from 'heroku-ssl-redirect'

import { logger } from './wrappers/log'
import { graffiti } from './factories/fun-factory'
import { envVarCheck } from './envvarcheck'
import { listen } from './wrappers/app'

import { callHistory } from './middlewares/callhistory'

import { IController } from './controllers/interfaces'
import { RootController } from './controllers/root-controller'
import { TestTokenController } from './controllers/testtoken-controller'
import { UserController } from './controllers/user-controller'

const port: number = parseInt(process.env.EXPRESS_PORT as string, 10)

const middlewares: Array<RequestHandler> = [
  Helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'self'"] } },
    referrerPolicy: { policy: 'same-origin' },
  }),
  HerokuSslRedirect(),
  BodyParser.json(),
  BodyParser.urlencoded({ extended: true }),
  callHistory,
]

const controllers: Array<IController> = [
  new RootController(),
  new TestTokenController(),
  new UserController(),
]

export const start = logger.wrap(async function start(): Promise<void> {
  try {
    graffiti()
    envVarCheck()
    listen(middlewares, controllers, port)
  } catch (error) {
    logger.fatal(error)
    process.exit(1)
  }
})

/**
 * If the file is being run directly, start the Recipe.Report API now.
 *
 * ```bash
 * node dist/recipereport.js
 * ```
 */
if (require.main === module) {
  start()
}
