# Hero photograph

The landing hero is this photograph, on every device and in every state. There
is no generated scene behind it any more — replacing the file replaces the hero.

```
client/public/hero-port.jpg
```

Prefer a different filename or a remote URL? Set the env var instead:

```
VITE_HERO_IMAGE=https://example.com/your-image.jpg
```

Guidance:
- Landscape, at least 2000px wide. It is rendered `object-cover`, cropped
  toward the right (`object-position: 70% center`), so keep the busy half of
  the frame on the right and quieter space on the left where the headline sits.
- A dark grade is applied over the top so light copy stays legible.
- Use an image you hold the rights to.
- **No other company's branding.** The file must not carry a third-party logo,
  company name, tagline, website or contact details — shipping it would put
  another business's identity on the AFRIMOS site. The current `hero-port.jpg`
  was cropped down to its unbranded middle band for exactly that reason.

Keep the filename `hero-port.jpg`, or point `VITE_HERO_IMAGE` at whatever you
use. It is referenced directly, so a missing file leaves the hero on its dark
gradient rather than falling back to anything.
