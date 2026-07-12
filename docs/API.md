# AFRIMOS API Reference

Base URL: `/api` · JSON everywhere · Authenticated endpoints require
`Authorization: Bearer <access token>`.

Errors return `{ "error": "message" }` (validation errors add a `details` array).

## Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | — | `{ email, password, fullName, role: supplier\|buyer, userType?, companyName? }` → `{ userId, token, refreshToken, user }`. Company name required for suppliers. Sends verification email. |
| POST | `/auth/login` | — | `{ email, password }` → `{ userId, token, refreshToken, user }` |
| POST | `/auth/logout` | — | Stateless; client discards tokens |
| POST | `/auth/verify-email` | — | `{ token }` from the emailed link |
| POST | `/auth/resend-verification` | ✓ | Re-sends the verification email |
| GET | `/auth/me` | ✓ | Current user |
| POST | `/auth/refresh-token` | — | `{ refreshToken }` → new token pair |

Access tokens last 24h, refresh tokens 7 days. Passwords are bcrypt-hashed (10 rounds).

## Suppliers

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/suppliers` | — | Public directory (verified only). Query: `search`, `category`, `certification`, `shippingTerms`, `sort` (`newest`\|`inquiries`, default rating), `page`, `limit` |
| GET | `/suppliers/me` | supplier | Own profile + completeness % |
| GET | `/suppliers/me/analytics` | supplier | Inquiries, response rate, messages, 30-day inquiry series |
| POST | `/suppliers/profile` | supplier | Create/update own profile (upsert) |
| GET | `/suppliers/:supplierId` | — | Public detail with products + reviews |
| GET | `/suppliers/:supplierId/products` | — | Product list |
| POST | `/suppliers/:supplierId/products` | supplier (owner) | Add product |
| GET | `/suppliers/:supplierId/reviews` | — | Reviews + average rating |
| POST | `/suppliers/:supplierId/reviews` | buyer | `{ rating 1-5, comment?, rfqId? }` — recalculates supplier rating |

## Products

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PUT | `/products/:productId` | supplier (owner) / admin | Update product |
| DELETE | `/products/:productId` | supplier (owner) / admin | Delete product |

## RFQs

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/rfqs` | buyer (email verified) | Create RFQ. `supplierId` targets one supplier; omit to broadcast to all verified suppliers in the category (they're notified by email). |
| GET | `/rfqs` | ✓ | Buyer: own RFQs. Supplier: direct RFQs + open broadcasts in their product categories. Admin: all. Query: `status`, `page`, `limit` |
| GET | `/rfqs/:rfqId` | participant | RFQ detail |
| GET | `/rfqs/:rfqId/messages` | participant | Thread for this RFQ |
| PUT | `/rfqs/:rfqId` | participant | Update fields/status; setting `Closed` stamps `closedAt` |
| DELETE | `/rfqs/:rfqId` | buyer (owner) / admin | Delete RFQ |

RFQ statuses: `Draft → Sent → Responded → Negotiating → Closed`.
The first supplier reply automatically moves `Sent → Responded` and claims broadcast RFQs.

## Messages

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/messages` | participant (email verified) | `{ rfqId, recipientId, messageBody, subject?, attachments? }` — emails the recipient |
| GET | `/messages/conversations` | ✓ | Conversation list grouped by RFQ with unread counts |
| GET | `/messages/:rfqId` | participant | Full thread; marks incoming messages as read |
| PUT | `/messages/:messageId/read` | recipient | Mark one message read |
| DELETE | `/messages/:messageId` | sender / admin | Delete a message |

## Admin (role: admin)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/admin/suppliers` | All supplier accounts. Query: `status` (`pending`\|`verified`\|`rejected`), `page` |
| PUT | `/admin/suppliers/:userId/verify` | `{ verificationStatus, notes? }` — emails the decision to the supplier |
| GET | `/admin/analytics` | Totals (suppliers, buyers, RFQs, messages, pending verifications) + 12-week growth series |
| GET | `/admin/users` | All users. Query: `role`, `search`, `page` |

## Uploads

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/upload` | ✓ | `multipart/form-data` field `file`. JPG/PNG/WebP, max 5MB → `{ url }`. Files served from `/uploads/…` |

Storage is local disk in the MVP, isolated in `server/src/routes/upload.routes.js`
so it can be swapped for S3/Cloudinary without touching other code.

## Misc

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | `{ status: "ok" }` — used by hosting platform health checks |
