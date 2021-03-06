"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decodeToken = exports.encodeToken = void 0;
const jwt_simple_1 = __importDefault(require("jwt-simple"));
const cryptography_1 = require("./cryptography");
exports.encodeToken = (userId, type, ttl) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error(`JWT error. Secret key is not defined.`);
    if (!userId)
        throw new Error(`JWT error. User ID is not defined.`);
    if (!type)
        throw new Error(`JWT error. Type is not defined.`);
    const payload = {
        id: userId,
        type: type,
        iat: new Date().toISOString(),
        ttl: ttl,
    };
    const stringified = JSON.stringify(payload);
    const encryptedPayload = cryptography_1.encrypt(stringified);
    const encodedToken = jwt_simple_1.default.encode(encryptedPayload, secret, 'HS512');
    return encodedToken;
};
exports.decodeToken = (token) => {
    const secret = process.env.JWT_SECRET;
    if (!secret)
        throw new Error(`JWT error. Secret key is not defined.`);
    if (!token)
        throw new Error(`JWT error. Token is not defined.`);
    const decodedToken = jwt_simple_1.default.decode(token, secret, false, 'HS512');
    const decryptedPayload = cryptography_1.decrypt(decodedToken);
    const parsed = JSON.parse(decryptedPayload);
    return parsed;
};
//# sourceMappingURL=token.js.map