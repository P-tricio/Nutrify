import { auth } from 'express-oauth2-jwt-bearer';

export const checkJwt = auth({
  audience: 'https://nutrify-api',
  issuerBaseURL: 'https://dev-c6dip11dmpk3zh02.us.auth0.com/',
  tokenSigningAlg: 'RS256'
});
