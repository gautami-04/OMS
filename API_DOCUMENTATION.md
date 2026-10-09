# API Documentation

Base URL for local development: `http://localhost:5000`

JSON endpoints accept and return JSON unless stated otherwise. For protected routes, send:

```http
Authorization: Bearer <JWT>
Content-Type: application/json
```

A successful login returns a JWT that expires after one day. The route inventory below is derived from the current `server/routes/` and `server/server.js` files.

## Endpoint inventory

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| GET | `/` | Public | API health/status |
| POST | `/api/auth/login` | Public | Authenticate and issue JWT |
| POST | `/api/auth/logout` | Public in current route configuration | Return logout-success message; client should clear token |
| GET | `/api/auth/users` | JWT required | List users without password field |
| GET | `/api/substations` | JWT required | List substations |
| GET | `/api/feeders` | JWT required | List feeders |
| GET | `/api/transformers` | JWT required | List transformers |
| GET | `/api/consumers` | JWT required | List consumers |
| GET | `/api/smart-meters` | JWT required | List smart meters |
| GET | `/api/smart-meters/:id` | JWT required | Get one smart meter |
| POST | `/api/smart-meters` | JWT required | Create smart meter |
| PUT | `/api/smart-meters/:id` | JWT required | Update smart meter |
| DELETE | `/api/smart-meters/:id` | JWT required | Delete smart meter |
| GET | `/api/outages` | JWT required | List outages |
| POST | `/api/outages` | JWT required | Create outage |
| PUT | `/api/outages/:id` | JWT required | Update outage |
| DELETE | `/api/outages/:id` | JWT required | Delete outage |
| GET | `/api/consumer-impact/:outageId` | JWT required | Calculate current impact for outage |
| GET | `/api/tickets` | JWT required | List tickets |
| POST | `/api/tickets` | JWT required | Create ticket |
| PUT | `/api/tickets/:id` | JWT required | Update ticket |
| DELETE | `/api/tickets/:id` | JWT required | Delete ticket |
| GET | `/api/reports/saidi` | JWT required | SAIDI calculation |
| GET | `/api/reports/saifi` | JWT required | SAIFI calculation |

The current API does not expose POST/PUT/DELETE endpoints for substations, feeders, transformers, or consumers. Their current backend routes are read-only list endpoints.

## Authentication

### `POST /api/auth/login`

Request:
```json
{
  "email": "admin@oms.com",
  "password": "Admin@123"
}
```

Success (`200`):
```json
{
  "message": "Login successful",
  "token": "<jwt>",
  "user": {
    "id": "<user-id>",
    "name": "<name>",
    "email": "<email>",
    "role": "Administrator"
  }
}
```

Missing email/password returns `400`. Invalid email or password returns `401`. A server-side failure returns `500`.

### `POST /api/auth/logout`

Returns `200` with `{"message":"Logout successful"}`. The current endpoint does not revoke an issued JWT; the client must clear its token/session.

### `GET /api/auth/users`

Requires JWT. Returns a user array with `password` excluded. The backend route currently uses `protect` middleware but does not attach the separate `authorize` middleware to this endpoint. The frontend restricts its User Management page to the Administrator role; do not treat that UI restriction as equivalent to server-side authorization.

## Asset list endpoints

These return JSON arrays:
- `GET /api/substations`
- `GET /api/feeders`
- `GET /api/transformers`
- `GET /api/consumers`

Each requires a valid JWT. Errors are generally returned as `500 {"message":"Server error"}`.

## Smart meters

### Create: `POST /api/smart-meters`

Example body:
```json
{
  "meterNumber": "SM-TEST-001",
  "consumer": "<consumer ObjectId>",
  "status": "Online",
  "voltage": 230,
  "current": 0,
  "power": 0
}
```

`meterNumber` and `consumer` are required. `status` accepts `Online`, `Offline`, or `Warning`. A successful create returns `201` and a populated smart-meter record. Missing required fields or duplicate meter numbers return `400`.

### Read / update / delete

- `GET /api/smart-meters` — returns list, populating consumer and transformer.
- `GET /api/smart-meters/:id` — returns one record; `404` if not found.
- `PUT /api/smart-meters/:id` — accepts fields such as `meterNumber`, `consumer`, `status`, `voltage`, `current`, `power`, and `lastReading`; returns `200`, `400` for duplicate number, or `404` if not found.
- `DELETE /api/smart-meters/:id` — returns success message or `404`.

Malformed IDs and unexpected database/validation errors may be returned as `500` by current controllers.

## Planned outages

### Create: `POST /api/outages`

Example body:
```json
{
  "title": "Scheduled feeder maintenance",
  "description": "Maintenance work",
  "feeder": "<feeder ObjectId>",
  "transformer": "<optional transformer ObjectId>",
  "startTime": "2026-10-12T09:00:00.000Z",
  "endTime": "2026-10-12T12:00:00.000Z",
  "status": "Scheduled"
}
```

The schema requires `title`, `feeder`, `startTime`, and `endTime`. `status` is `Scheduled`, `In Progress`, or `Restored` and defaults to `Scheduled`. Success returns `201`.

- `GET /api/outages` — returns outage list, populating feeder and transformer.
- `PUT /api/outages/:id` — updates the provided fields; returns `200` or `404`.
- `DELETE /api/outages/:id` — deletes and returns a message; returns `404` if absent.

Controller error handling may return `500` for malformed IDs, invalid input, or database failures. Validate that `endTime` is after `startTime` in client workflows; do not assume the schema itself enforces positive duration.

## Consumer impact

### `GET /api/consumer-impact/:outageId`

Requires JWT. Returns outage metadata plus:
- `consumerCount`
- `affectedConsumers`
- `affectedFeeders`
- `affectedTransformers`

For a transformer-targeted outage, the controller finds consumers referencing that transformer. For a feeder outage, it finds transformers on the feeder and consumers referencing those transformers. For a restored outage, the controller returns zero current impact and empty affected arrays. A missing outage returns `404`.

## Tickets

### Create: `POST /api/tickets`

Example body:
```json
{
  "outage": "<planned outage ObjectId>",
  "fieldEngineer": "<optional user ObjectId>",
  "description": "Inspect affected distribution equipment",
  "status": "Open"
}
```

Required schema fields: `outage`, `description`, `status`. `fieldEngineer` is optional. Success returns `201`.

- `GET /api/tickets` — lists tickets with outage/asset and field-engineer details populated.
- `PUT /api/tickets/:id` — updates ticket fields; returns `200` or `404`.
- `DELETE /api/tickets/:id` — deletes and returns a message; returns `404` if absent.

`Ticket.status` is a string in the model; no Mongoose enum is defined.

## Reliability reports

### `GET /api/reports/saidi`

Returns the current SAIDI summary. The exact numeric result depends on the stored database data. The response includes the SAIDI value and supporting counts/duration totals as implemented by `reliabilityController.js`.

### `GET /api/reports/saifi`

Returns the current SAIFI summary and supporting counts as implemented by `reliabilityController.js`.

Formulas:
- `SAIDI = Σ(Ni × Ui) / NT`
- `SAIFI = ΣNi / NT`

`Ni` is the affected consumer count for outage `i`; `Ui` is outage duration in hours; `NT` is the total consumer count. Invalid, non-finite, zero, and negative durations are excluded by the current calculation. Values should be interpreted in the context of the current database contents.

## Socket.IO events

The server accepts Socket.IO connections (development CORS origin is `http://localhost:5173`). On outage mutations it broadcasts:

Event: `outage:changed`

Payload examples:
```json
{"type":"created","outageId":"<outage-id>"}
{"type":"updated","outageId":"<outage-id>"}
{"type":"deleted","outageId":"<outage-id>"}
```

The event is broadcast from the server to connected sockets. Whether a page updates immediately depends on whether that frontend component subscribes to and handles the event.

## Common status codes

| Status | Meaning |
|---|---|
| `200` | Request succeeded |
| `201` | Resource created |
| `400` | Request validation/required fields/duplicate meter number (where explicitly handled) |
| `401` | Missing or invalid JWT / invalid login |
| `404` | Requested record not found (where explicitly handled) |
| `500` | Unhandled validation/database/controller error in current implementation |

## Notes

- API paths and behavior reflect the source package reviewed for this document. If endpoints are changed, update this file.
- This documentation does not claim that every operation is role-restricted on the backend. Most protected routes use JWT authentication middleware; role-specific backend enforcement requires a separate verified configuration.
