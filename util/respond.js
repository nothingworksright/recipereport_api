#!/usr/bin/env node

'use strict'

/**
 * Express Response utilities.
 * @author {@link https://github.com/jmg1138 jmg1138}
 */

/**
 * Require the 3rd party modules that will be used.
 * @see {@link https://github.com/tjmehta/error-to-json error-to-json}
 * @see {@link https://github.com/petkaantonov/bluebird bluebird}
 */
const err2json = require('error-to-json')
const P = require('bluebird').resolve

/**
 * Send the Express HTTP response with error information.
 * @param {Object} res HTTP res that Express sends when it gets a req.
 * @param {Error} err Error object to include with the res.
 */
function error (res, err) {
  return new P(res
    .status(200)
    .json({
      'status': 'error',
      'message': err.message,
      'json': {
        name: err2json(err).name
      }
    }))
}
exports.error = error

/**
 * Send the Express HTTP response with success information.
 * @param {Object} res HTTP res that Express sends when it gets a req.
 * @param {String} message Message to include with the res.
 * @param {Object} json Object to include with the res.
 */
function success (res, message, json) {
  return new P(res
    .status(200)
    .json({
      'status': 'success',
      'message': message,
      'json': json
    })
  )
}
exports.success = success