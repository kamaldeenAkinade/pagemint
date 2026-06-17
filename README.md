# PageMint

Paste HTML, get a free shareable link. No code, no hosting, no account.

## Stack

- Next.js (App Router, TypeScript)
- Upstash Redis (`@upstash/redis`) via the Vercel Marketplace integration
- `nanoid` for ids and secret keys
- Plain CSS, no UI framework

## Local development

1. `npm install`
2. `vercel link`
3. Provision Upstash Redis from the Vercel dashboard Marketplace (or `vercel install upstash`)
4. `vercel env pull .env.local`
5. `npm run dev`

## Data model

Each page is stored in Redis under `page:<id>`:

```json
{ "html": "...", "editToken": "...", "createdAt": 0, "updatedAt": 0 }
```

The `editToken` is returned only once, at creation time, and is required to edit or delete the page later.

## A note on safety

PageMint intentionally does not sanitize pasted HTML or JavaScript — rendering arbitrary pages exactly as pasted is the entire point of the tool. Pasted pages run their own code, so only paste content you trust or created yourself.

## Deploy

```
vercel --prod
```
