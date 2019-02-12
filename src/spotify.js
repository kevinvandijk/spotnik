import SpotifyWebApi from 'spotify-web-api-node';
import promiseRetryify from 'promise-retryify';
import spotifyUri from 'spotify-uri';

const spotifyApi = promiseRetryify(
  new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: 'http://localhost:3000',
    refreshToken: process.env.SPOTIFY_REFRESH_TOKEN
  }), {
    maxRetries: 2,
    retryTimeout: () => 100,
    shouldRetry: (err) => err.statusCode === 401,
    beforeRetry: () => {
      console.log('Refreshing access token');
      return refreshToken();
    }
  }
);

async function refreshToken() {
  const data = await spotifyApi.refreshAccessToken();

  spotifyApi.setAccessToken(data.body.access_token);
};

export function getSpotifyTrackFromUrl(uri) {
  const parsed = spotifyUri.parse(uri);

  return parsed.type === 'track'
    ? `spotify:track:${parsed.id}`
    : null;
}

export default spotifyApi;

// For reference, if you need to generate an initial refresh token, these things need to happen:
//
// const getAuthorizeURL = () => {
//     const scopes = [
//       'playlist-read-private',
//       'playlist-modify-private',
//       'playlist-modify-public',
//       'playlist-read-collaborative'
//     ];

//     const state = 'blabla';
//     const authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

//     console.log('authorizeURL:', authorizeURL);
// }

// const getInitialRefreshToken = () => {
//   // This was given in the url parameters on the spotify redirect when hitting the authorizeURL, just hardcode it for now
//   const code = process.env.SPOTIFY_AUTHORIZATION_CODE;
//   const { body } = await spotifyApi.authorizationCodeGrant(code);

//    console.log('The token expires in ' + body.expires_in);
//    console.log('The access token is ' + body.access_token);
//    console.log('The refresh token is ' + body.refresh_token);
// }
