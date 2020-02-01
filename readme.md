for local development (unix systems)
1. first run `ENV=DEV npm build`
2. then `npm start`

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