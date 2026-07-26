# Hero photograph

The landing hero uses a photograph when one is present, and falls back to the
generated 3D container yard when it is not.

To use a photo, drop it here named `hero-port` with any of these extensions:

```
client/public/hero-port.jpg     (or .jpeg, .png, .webp, .avif)
```

It is picked up automatically on the next build — no rename, conversion or
code change needed.

Prefer a different filename or a remote URL? Set the env var instead:

```
VITE_HERO_IMAGE=https://example.com/your-image.jpg
```

Guidance:
- Landscape, at least 2000px wide. It is rendered `object-cover`, cropped
  toward the right (`object-position: 70% center`), so keep the busy half of
  the frame on the right and quieter space on the left where the headline sits.
- A dark grade is applied over the top so white copy stays legible.
- Use an image you hold the rights to.
- **No other company's branding.** The file must not carry a third-party logo,
  company name, tagline, website or contact details — shipping it would put
  another business's identity on the AFRIMOS site. The current `hero-port.jpg`
  was cropped down to its unbranded middle band for exactly that reason.

Above `md`, an AFRIMOS container is composited in front of the photograph
(`components/three/ContainerShowpiece.tsx`), so the hero has our own box in it
whatever the backdrop happens to be.
