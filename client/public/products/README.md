# Product photography

Commodity cards, the detail modal and the demand rings all render a picture of
the goods. By default that picture is drawn in SVG
(`src/components/ui/CommodityArt.tsx`) — coffee beans, sesame seed, lentils
and chickpeas, niger and sunflower seed, korarima pods and turmeric, citrus
and avocado.

To replace any of them with a real photograph, drop a file in here named after
the commodity:

```
client/public/products/coffee.jpg      (or .jpeg, .png, .webp, .avif)
client/public/products/sesame.jpg
client/public/products/pulses.jpg
client/public/products/oilseeds.jpg
client/public/products/spices.jpg
client/public/products/fruits.jpg
```

It is picked up on the next build, per commodity — you can add one photo or
all six, and whatever is missing keeps its drawn version. No code change.

Guidance:
- Square-ish crops work best. The image is rendered `object-cover` into a tall
  card, a wide modal banner and a small circle, so keep the subject centred.
- Shoot or crop close: these read as a pile of the goods, not a packshot on a
  table.
- Use images you hold the rights to, with no other company's branding in frame.
