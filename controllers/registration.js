#!/usr/bin/env node

'use strict'

/**
 * The registration controller.
 * @author {@link https://github.com/jmg1138 jmg1138}
 */

const account = require('../lib/account')
const AccountModel = require('../models/account')
const crypt = require('../lib/crypt')
const email = require('../lib/email')
const token = require('../lib/token')
const respond = require('../lib/respond')

async function creation (req, res) {
  try {
    await email.looksOk(req.body.email)
    const Account = await account.create(req.body.email, req.body.password)
    await token.accountDefined(Account)
    const Token = await token.sign(Account)
    const reply = await email.sendActivation(req.body.email, req.headers, Token)
    respond.success(res, `Registration successful`, reply)
  } catch (err) {
    respond.error(res, err)
  }
}

async function activation (req, res) {
  try {
    await token.tokenDefined(req.params.token)
    const decoded = await token.verify(req.params.token)
    const accountId = await crypt.decrypt(decoded.data.toString())
    let Account = await AccountModel.findOne({_id: accountId})
    Account.activated = true
    await Account.save()
    respond.success(res, 'Activation successful.')
  } catch (err) {
    respond.error(res, err)
  }
}

module.exports = {
  creation: creation,
  activation: activation
}