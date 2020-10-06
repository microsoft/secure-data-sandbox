import * as jwt from 'jsonwebtoken';
/**
 * Retrieve User's sub information from aad accesstoken
 * 
 * @param {string} accessToken the jwt token from req.header.authorization after aad authentication
 * 
 * @return {string} the authenticated user's sub or error message
 */
export function RetrieveUserFromAuthToken(accessToken: string): string {
  if (accessToken) {
    if (accessToken.substring(0, 7) === 'Bearer ') {
      accessToken = accessToken.substring(7);
    }
    const decoded = jwt.decode(accessToken, { complete: true });
    if (decoded && Object(decoded).payload && Object(decoded).payload.sub) {
      return Object(decoded).payload.sub;
    } else if (!Object(decoded) || !Object(decoded).payload) {
      return 'AccessToken is invalid to decode (invalid format)';
    } else {
      return 'AccessToken no user sub';
    }
  } else {
    return 'No AccessToken';
  }
}
