// import path from 'path';
import 'dotenv/config';
import telegram from './telegram';
import spotify, { getSpotifyTrackFromUrl } from './spotify';

// FOR NOW THIS SHOULD ALWAYS BE 2 USER IDS, NOT MORE, IT'S ABOUT WHICH CONVERSATION TO LISTEN TO
const listenTo = [parseInt(process.env.TELEGRAM_USER1, 10), parseInt(process.env.TELEGRAM_USER2, 10)];
const playlistId = process.env.SPOTIFY_PLAYLIST_ID;

async function addTracksToPlaylist(id, trackIds, removeDuplicates = false) {
  const spotifyTrackIds = Array.isArray(trackIds) ? trackIds : [trackIds];

  if (removeDuplicates) {
    await spotify.removeTracksFromPlaylist(id, spotifyTrackIds.map(trackId => ({ uri: trackId })));
  }

  await spotify.addTracksToPlaylist(id, spotifyTrackIds, { position: 1 });
}

telegram.connect(connection => {
  connection.on('message', async message => {
    if (message.event !== 'message') return;
    if (!message.text) return;

    console.log('received message', message.text);


    const urlRegex = /(https?:\/\/[^\s]+)/gi;
    const urls = message.text.match(urlRegex) || [];
    const spotifyIds = urls.map(url => getSpotifyTrackFromUrl(url)).filter(id => id);

    if (spotifyIds.length) {
      await addTracksToPlaylist(playlistId, spotifyIds);
    }
  });

  connection.on('error', e => {
    console.log('Error from Telegram API:', e);
  });

  connection.on('disconnect', () => {
    console.log('Disconnected from Telegram API');
  });
});
