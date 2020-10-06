import { assert } from 'chai';
import { RetrieveUserFromAuthToken } from '.././src/auth';
import * as jwtBuilder from 'jwt-builder';

// define the accessToken here
// This is the dummy accessToken from this doc: https://docs.microsoft.com/en-us/azure/active-directory/develop/access-tokens
const sampleAccessToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6Imk2bEdrM0ZaenhSY1ViMkMzbkVRN3N5SEpsWSJ9.eyJhdWQiOiI2ZTc0MTcyYi1iZTU2LTQ4NDMtOWZmNC1lNjZhMzliYjEyZTMiLCJpc3MiOiJodHRwczovL2xvZ2luLm1pY3Jvc29mdG9ubGluZS5jb20vNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3L3YyLjAiLCJpYXQiOjE1MzcyMzEwNDgsIm5iZiI6MTUzNzIzMTA0OCwiZXhwIjoxNTM3MjM0OTQ4LCJhaW8iOiJBWFFBaS84SUFBQUF0QWFaTG8zQ2hNaWY2S09udHRSQjdlQnE0L0RjY1F6amNKR3hQWXkvQzNqRGFOR3hYZDZ3TklJVkdSZ2hOUm53SjFsT2NBbk5aY2p2a295ckZ4Q3R0djMzMTQwUmlvT0ZKNGJDQ0dWdW9DYWcxdU9UVDIyMjIyZ0h3TFBZUS91Zjc5UVgrMEtJaWpkcm1wNjlSY3R6bVE9PSIsImF6cCI6IjZlNzQxNzJiLWJlNTYtNDg0My05ZmY0LWU2NmEzOWJiMTJlMyIsImF6cGFjciI6IjAiLCJuYW1lIjoiQWJlIExpbmNvbG4iLCJvaWQiOiI2OTAyMjJiZS1mZjFhLTRkNTYtYWJkMS03ZTRmN2QzOGU0NzQiLCJwcmVmZXJyZWRfdXNlcm5hbWUiOiJhYmVsaUBtaWNyb3NvZnQuY29tIiwicmgiOiJJIiwic2NwIjoiYWNjZXNzX2FzX3VzZXIiLCJzdWIiOiJIS1pwZmFIeVdhZGVPb3VZbGl0anJJLUtmZlRtMjIyWDVyclYzeERxZktRIiwidGlkIjoiNzJmOTg4YmYtODZmMS00MWFmLTkxYWItMmQ3Y2QwMTFkYjQ3IiwidXRpIjoiZnFpQnFYTFBqMGVRYTgyUy1JWUZBQSIsInZlciI6IjIuMCJ9.pj4N-w_3Us9DrBLfpCt';

describe('Retrieve User Info From AuthToken', () => {
  it('result in valid accessToken from aad', async () => {
    assert.equal(RetrieveUserFromAuthToken(sampleAccessToken).length, 43);
    assert.equal(
      RetrieveUserFromAuthToken(sampleAccessToken),
      'HKZpfaHyWadeOouYlitjrI-KffTm222X5rrV3xDqfKQ'
    );
  });

  it('result in valid accessToken from aad with "Bearer " string', async () => {
    assert.equal(
      RetrieveUserFromAuthToken('Bearer ' + sampleAccessToken).length,
      43
    );
    assert.equal(
      RetrieveUserFromAuthToken(sampleAccessToken),
      'HKZpfaHyWadeOouYlitjrI-KffTm222X5rrV3xDqfKQ'
    );
  });

  it('result in no accessToken ', async () => {
    assert.equal(RetrieveUserFromAuthToken(null), 'No AccessToken');
  });

  it('result in uncorrect accessToken form', async () => {
    assert.equal(RetrieveUserFromAuthToken(''), 'No AccessToken');
  });

  it('result in accessToken no user sub', async () => {
    const token = jwtBuilder({
      secret: 'super-secret',
      headers: {
        kid: '2000-00-00',
      },
    });
    assert.equal(RetrieveUserFromAuthToken(token), 'AccessToken no user sub');
  });

  it('result in invalid accessToken', async () => {
    const invalidToken = '0000'
    assert.equal(RetrieveUserFromAuthToken(invalidToken), 'AccessToken is invalid to decode (invalid format)');
  });
});
