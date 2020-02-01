# Spotify Playlist Joiner App

A simple app to combine songs from 2 different playlists into one single playlist.

### How to build?

Make sure you have `node` and `npm` installed.

for local development (unix systems)
1. first run `npm run build`
2. then `npm run start`

for production builds
1. install `npm install minify -g`
2. install `npm install html-minifier -g`
3. build for production `npm run production`

for local development (windows)
1. copy paste all files from `src/.` to `docs/`
2. replace variables `#[VUE_URL]` and `#[REDIRECT_URL]` in `docs/index.html` and `docs/config.js` respectively, depending on prod or dev build, check variable values below
```
ENV=DEV
VUE_URL=https://cdn.jsdelivr.net/npm/vue/dist/vue.js
REDIRECT_URL=http://localhost:3000/

ENV=PROD
VUE_URL=https://cdn.jsdelivr.net/npm/vue
REDIRECT_URL=https://polltery.github.io/spotify-playlist-joiner-app/
```