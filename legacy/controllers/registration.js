#!/usr/bin/env node

'use strict'

/**
 * The registration-route controller.
 * @author {@link https://github.com/jmg1138 jmg1138}
 */

const Account = require('../models/account')
const accounts = require('../lib/accounts')
const crypts = require('../lib/crypts')
const emails = require('../lib/emails')
const tokens = require('../lib/tokens')
const responds = require('../lib/responds')

async function creation (req, res) {
  try {
    await emails.check(req.body.email)
    const account = await accounts.create(req.body.email, req.body.password)
    const token = await tokens.sign(account, { type: 'activation' })
    const render = await emails.render(req.body.email, token)
    const reply = await emails.send(render.from, req.body.email, render.subject, render.text)
    responds.success(res, 'Registration successful.', reply)
  } catch (err) {
    responds.error(res, err)
  }
}

async function activation (req, res) {
  try {
    const decoded = await tokens.verify(req.params.token)
    const accountId = await crypts.decrypt(decoded.id.toString())
    if (decoded.type === undefined || decoded.type !== 'activation') {
      const error = new Error('Token type not activation.')
      error.name = 'RegistrationActivationError'
      throw error
    }
    const account = await Account.findOne({ _id: accountId })
    if (account === null || account === undefined) {
      const error = new Error('Account not found.')
      error.name = 'RegistrationActivationError'
      throw error
    }
    account.activated = true
    await account.save()
    responds.success(res, 'Activation successful.')
  } catch (err) {
    responds.error(res, err)
  }
}

module.exports = {
  creation: creation,
  activation: activation
}