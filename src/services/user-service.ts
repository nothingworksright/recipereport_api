/**
 * User service.
 * @author {@link https://github.com/jmg1138 jmg1138}
 */

import {
  UserActivationRequest,
  UserRegistrationRequest,
} from '../db/models/service-requests'
import {
  UserActivationResponse,
  UserRegistrationResponse,
} from '../db/models/service-responses'
import { UserModel } from '../db/models/user-model'
import { UserFactory } from '../factories/user-factory'
import { UserRepo } from '../repositories/user-repo'
import { PostgreSQL } from '../db/index'
import { DomainConverter } from '../db/models/domainconverter'
import { decodeToken, encodeToken, Payload, tokenType } from '../wrappers/token'
import { EmailMessageService } from './email-message-service'

export interface IUserService {
  register(
    userRegistrationRequest: UserRegistrationRequest
  ): Promise<UserRegistrationResponse<UserModel>>
}

export class UserService implements IUserService {
  public async register(
    req: UserRegistrationRequest
  ): Promise<UserRegistrationResponse<UserModel>> {
    const res = new UserRegistrationResponse<UserModel>()
    const db = await new PostgreSQL().getClient()
    try {
      // User factory creates an instance of a user.
      const userFactory = new UserFactory()
      const newUser = await userFactory.create({ ...req.item })

      // User repository saves user to the db.
      // Dehydrate the new user into a DTO for the repository.
      const userDehydrated = DomainConverter.toDto<UserModel>(newUser)
      const userRepo = new UserRepo(db)
      const repoResult = await userRepo.createOne(userDehydrated)

      // Hydrate a user instance from the repository results.
      const userHydrated = DomainConverter.fromDto<UserModel>(
        UserModel,
        repoResult.rows[0]
      )

      // Create a JWT for the new user's activation email.
      // const tokenType: string = `activation`
      const ttl = new Date().getTime() + 24 * 60 * 60 * 1000
      const token = encodeToken(
        userHydrated.id as string,
        tokenType.ACTIVATION,
        ttl
      )

      // Email message service sends a registration email.
      const emailMessageService = new EmailMessageService()
      await emailMessageService.sendActivation(userHydrated, token)

      res.setItem(userHydrated)
      res.setSuccess(true)
    } catch (error) {
      res.setError(error)
    }
    db.release()
    return res
  }

  public async activate(
    req: UserActivationRequest
  ): Promise<UserActivationResponse<UserModel>> {
    const res = new UserActivationResponse<UserModel>()
    const db = await new PostgreSQL().getClient()
    try {
      // Decode and decrypt the token.
      const encryptedEncodedToken = req.item?.token
      const payload: Payload = decodeToken(encryptedEncodedToken)

      // Verify token type is activation
      if (payload.type !== tokenType.ACTIVATION)
        throw new Error(`Activation error. Token type is not activation.`)

      // Find the user in the database
      const userRepo = new UserRepo(db)
      const findResult = await userRepo.findOneById(payload.id)

      // Hydrate a user instance from the repository results.
      const userHydrated = DomainConverter.fromDto<UserModel>(
        UserModel,
        findResult.rows[0]
      )

      // Set the user as activated
      userHydrated.setDateActivated(new Date())

      // Save the activated user.
      // Dehydrate the activated user into a DTO for the repository.
      const userDehydrated = DomainConverter.toDto<UserModel>(userHydrated)
      const updateResult = await userRepo.updateOneById(userDehydrated)
      const activatedUser = updateResult.rows[0]

      // Respond with success
      res.setItem(activatedUser)
      res.setSuccess(true)
    } catch (error) {
      res.setError(error)
    }
    db.release()
    return res
  }
}
