# Hero photograph

The landing hero uses a photograph when one is present, and falls back to the
generated 3D container yard when it is not.

To use a photo, drop it here as:

```
client/public/hero-port.jpg
```

It is picked up automatically on the next build — no code change needed.

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
