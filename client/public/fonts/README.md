# Self-hosted fonts

The Measured hero applies **Helvetica Neue Roman** via the `.font-helvetica-neue`
class (declared with `@font-face` in `src/index.css`).

Helvetica Neue is a licensed, proprietary typeface, so its binaries are **not**
committed to this repo. To enable it, drop the licensed web files here:

```
client/public/fonts/HelveticaNeue-Roman.woff2
client/public/fonts/HelveticaNeue-Roman.woff
```

They are served from `/fonts/…` at runtime (Vite serves everything in
`public/` from the site root).

Until the files are present, the `@font-face` rule simply fails to load and the
fallback chain takes over:

```
'Helvetica Neue Roman', 'Helvetica Neue', Helvetica, Arial, 'Inter', sans-serif
```

so the page still renders correctly — just with the closest available fallback.
