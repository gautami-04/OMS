# User Manual — Smart Grid OMS

## 1. Purpose

This manual explains how to use the Smart Grid Outage Management System web application. It covers the available UI workflows for reviewing the network, managing outages, checking consumer impact, handling tickets, viewing reliability indices, and exporting reports.

## 2. Before you start

The application must be running locally or be hosted by your project team. For local setup, follow the Installation section in `README.md`. You will need a configured MongoDB database and the environment variables used by the backend and frontend.

## 3. Sign in

1. Open the frontend URL printed by Vite (normally `http://localhost:5173`).
2. Use an account created by the seed scripts or provided by the project administrator.
3. Enter the email and password and submit the login form.
4. After successful login, the app stores session information and opens the application dashboard.
5. Use the application's logout control when finished. The current backend logout endpoint returns a success response; client-side session clearing is what removes the local token.

Do not use demo credentials in a deployed environment.

## 4. Dashboard

The dashboard is the starting point after login. Review the summary cards and outage information, then use the application navigation to open the module you need. Dashboard values reflect the records returned by the current backend; they are not a live connection to physical grid equipment.

## 5. GIS Map

1. Open **GIS Map** from the navigation.
2. Allow the map tiles to load. If the map background is missing, check the MapTiler API key and browser network console.
3. Use the layer controls to show or hide available network layers, such as substations, feeders, transformers, consumers, smart meters, and outage overlays where provided.
4. Select a map marker or use available search/navigation controls to inspect the displayed asset.
5. If an asset is missing, verify that it exists in MongoDB and has latitude/longitude data where the model requires it.

The map visualizes application records. It does not represent physical SCADA telemetry.

## 6. Asset registry

1. Open **Assets**.
2. Review the asset types and records available in the interface.
3. Use the smart-meter section for the CRUD controls exposed by the current UI.
4. For smart-meter creation, provide a unique meter number, a valid consumer reference, and any applicable status/reading values.
5. Update records carefully and verify that the displayed values reflect the saved record.

The backend currently provides list-only endpoints for substations, feeders, transformers, and consumers. Do not expect CRUD controls for those entities unless they are implemented in a future version.

## 7. Planned outage management

1. Open **Outages**.
2. Create a planned outage using a title, feeder, start time, end time, and optional description/transformer.
3. Choose a supported status: `Scheduled`, `In Progress`, or `Restored`.
4. Save the record and confirm it appears in the outage list.
5. Use the update action to change details or status as work progresses.
6. When service is restored, set status to `Restored`.
7. Delete only records that should be removed from the project dataset.

Check that the end time is later than the start time. Reliability calculations exclude invalid or non-positive durations, but the outage model does not define a dedicated duration validator.

## 8. Consumer impact analysis

1. Open **Consumer Impact**.
2. Select an outage from the available list.
3. Review the affected consumer count and the affected feeder/transformer/consumer lists.
4. For a feeder outage, the application follows feeder-to-transformer and transformer-to-consumer references.
5. For a transformer outage, it identifies consumers connected to that transformer.
6. A restored outage is treated as historical and returns zero current impacted consumers.

If the impact result looks incorrect, confirm the outage's feeder/transformer references and the downstream records in MongoDB.

## 9. Crew and tickets

1. Open **Crew / Tickets**.
2. Create a ticket linked to an existing outage.
3. Add a description and, where available, assign a field engineer.
4. Set the ticket status used by your workflow.
5. Save and verify the ticket appears in the list.
6. Use the update and delete controls only when appropriate.

The current Mongoose schema requires an outage, description, and status. The `fieldEngineer` reference is optional and ticket status is stored as a string.

## 10. Reliability

1. Open **Reliability**.
2. Review the displayed SAIDI and SAIFI values and their supporting metrics.
3. Interpret values relative to the database's current consumer and outage records.

SAIDI represents average interruption duration per customer; SAIFI represents average interruptions per customer. The calculations exclude invalid or non-positive outage durations. These indices are calculated from stored records, not a utility's live operational feed.

## 11. Reports and PDF export

1. Open **Reports**.
2. Choose a report type from the form.
3. Select the start and end dates and generate the report summary.
4. Find the report in the report list.
5. Select **Export PDF** to download a PDF based on the current outage, consumer, and reliability data passed to the PDF generator.
6. Open the downloaded file and verify the report type, date, and displayed records before sharing it.

Important limitation: the current UI creates a report-summary/list entry locally and the PDF generator uses the currently fetched records. The selected date range is included in the report name, but the current code should not be assumed to filter the underlying database data by that range unless date filtering is added and verified.

## 12. User management

The `/users` page is restricted to the Administrator role in the frontend route configuration. It lists accounts through `GET /api/auth/users`. The current backend route requires a JWT but does not attach the separate role-authorization middleware; treat server-side role enforcement as a security item to review before deployment.

## 13. Troubleshooting

| Problem | What to check |
|---|---|
| Login fails | Verify email/password and confirm the user seed script has been run |
| API unavailable | Confirm backend is running and `VITE_API_URL` points to the correct API origin |
| MongoDB connection error | Check `MONGO_URI`, network access, and database credentials |
| Map tiles missing | Check `VITE_MAPTILER_KEY` and browser console/network errors |
| Protected page redirects | Sign in again and confirm a valid token is stored |
| Consumer impact is empty | Confirm outage status and feeder/transformer/consumer references |
| PDF export fails | Check browser console and ensure the report context loaded successfully |
| Port already in use | Stop the other process or configure a different `PORT` and matching frontend API URL |

## 14. Safe usage

- Use a test database for experiments.
- Do not commit `.env` files or share JWT secrets.
- Do not treat the app as a control system for physical grid devices.
- Confirm exported PDFs before sending them to a mentor or external recipient.
