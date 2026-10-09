# Smart Grid Outage Management System (OMS)

A full-stack **Smart Grid Outage Management System (OMS)** developed to support planned power outage monitoring, GIS-based grid visualization, consumer impact analysis, field maintenance workflows, and electricity distribution reliability reporting.

The application uses React, Leaflet, Node.js, Express.js, MongoDB, JWT authentication, and Socket.IO to provide a centralized interface for managing grid assets and outage records.

##  Problem Statement

Electrical distribution networks require effective coordination of grid infrastructure, planned maintenance, outage records, and affected consumers. Maintaining this information across disconnected systems can make outage tracking, consumer impact assessment, and reliability reporting more difficult.

This project addresses these challenges through a centralized web application that brings grid asset visualization, outage lifecycle management, consumer impact analysis, and reliability calculations into one system.

##  Key Features

### 1. Authentication and User Access
- JWT-based user authentication.
- Password hashing using bcryptjs.
- Role-oriented application navigation and access workflows.
- User management interface for viewing system accounts.

### 2. Operations Dashboard
- Overview of grid assets and outage records.
- Summary cards for key operational information.
- Quick access to grid mapping, outages, tickets, and reports.

### 3. GIS-Based Grid Visualization
- Interactive maps powered by Leaflet and React-Leaflet.
- Visualization of substations, feeders, transformers, consumers, smart meters, and outage locations where data is available.
- Map navigation and search functionality.
- Spatial representation of affected grid areas.

### 4. Planned Outage Management
- Create, view, update, and delete planned outage records.
- Track outages through `Scheduled`, `In Progress`, and `Restored` states.
- Maintain outage information for operational monitoring and reporting.

### 5. Grid Asset Registry
- View grid infrastructure across the distribution hierarchy.
- Retrieve substation, feeder, transformer, and consumer information.
- Manage smart meter records and their stored readings and status information.

### 6. Consumer Impact Analysis
- Identify consumers associated with affected grid infrastructure.
- Trace downstream assets to estimate the impact of an outage.
- Display affected consumers, feeders, and transformers where the available asset relationships support the analysis.

### 7. Crew and Maintenance Tickets
- Create and manage maintenance tickets.
- Track ticket progress through `Open`, `In Progress`, and `Resolved` states.
- Associate tickets with relevant outage or maintenance information.

### 8. Reliability Analysis
The system calculates two key distribution reliability indicators using outage and consumer data:

- **SAIDI:** System Average Interruption Duration Index.
- **SAIFI:** System Average Interruption Frequency Index.

The calculation logic excludes outages with invalid or non-positive durations where applicable.

### 9. Reports and Analytics
- Access operational and reliability reporting features.
- Review calculated reliability indicators.
- Generate and export reports through the reporting interface.

### 10. Outage Event Broadcasting
- Socket.IO broadcasts outage change events from the backend.
- Connected clients can receive outage events for integration with operational interfaces.

> **Note:** Smart meter readings are application-stored data. The system does not provide direct physical smart meter telemetry or SCADA integration.

##  Technology Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, JavaScript |
| GIS and Mapping | Leaflet, React-Leaflet, MapTiler |
| Styling | CSS |
| Icons | Lucide React |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT, bcryptjs |
| Real-Time Communication | Socket.IO |
| API Communication | REST APIs |
| Development Tools | Git, GitHub, VS Code, npm |

##  Reliability Calculations

### System Average Interruption Duration Index (SAIDI)

SAIDI represents the average interruption duration per consumer over the period represented by the available data.

\[
\text{SAIDI}=\frac{\sum(N_i \times U_i)}{N_T}
\]

Where:

- \(N_i\) = Number of consumers affected by outage \(i\).
- \(U_i\) = Duration of outage \(i\), in hours.
- \(N_T\) = Total number of consumers in the system's dataset.

**Unit:** Hours per consumer.

### System Average Interruption Frequency Index (SAIFI)

SAIFI represents the average number of interruptions per consumer over the period represented by the available data.

\[
\text{SAIFI}=\frac{\sum N_i}{N_T}
\]

Where:

- \(N_i\) = Number of consumers affected by outage \(i\).
- \(N_T\) = Total number of consumers in the system's dataset.

**Unit:** Interruptions per consumer.

**Important:** These formulas describe the implemented calculation approach. The accuracy and interpretation of the resulting metrics depend on the completeness of outage durations, affected-consumer counts, and the reporting period represented by the stored data.

## Project Structure

```text
OMS/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seedData.js
│   ├── seedUser.js
│   ├── seedFieldEngineer.js
│   ├── server.js
│   └── package.json
│
├── API_DOCUMENTATION.md
├── DATABASE_SCHEMA.md
├── TESTING.md
├── USER_MANUAL.md
├── FINAL_PROJECT_REPORT.md
└── README.md
```

*The tree shows the main application structure and documentation files. Individual controller, model, route, and page files are organized within their respective directories.*

##  Prerequisites

Before running the application locally, install:

- **Node.js:** Version 18 or higher.
- **npm:** Compatible with your installed Node.js version.
- **MongoDB:** A MongoDB Atlas cluster or a local MongoDB instance.
- **MapTiler API key:** Required if the configured map layer uses MapTiler.

##  Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/gautami-04/OMS.git
cd OMS
```

### 2. Configure the backend

Open a terminal:

```bash
cd server
npm install
```

Create a `server/.env` file and configure the required environment variables:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```

Use your own MongoDB connection string and a strong secret. Do not commit `.env` files or credentials to GitHub.

### 3. Seed the database

If you are setting up a fresh database, run the relevant seed scripts from the `server` directory:

```bash
node seedUser.js
node seedFieldEngineer.js
node seedData.js
```

Run each script as appropriate for your setup. Check the seed scripts before executing them against a database containing existing data.

### 4. Start the backend

From the `server` directory:

```bash
npm start
```

The backend is expected to run at:

```text
http://localhost:5000
```

### 5. Configure the frontend

Open a second terminal:

```bash
cd client
npm install
```

Create a `client/.env` file:

```env
VITE_API_URL=http://localhost:5000/api
VITE_MAPTILER_KEY=your_maptiler_api_key
```

Use the environment variable names expected by the application configuration.

### 6. Start the frontend

From the `client` directory:

```bash
npm run dev
```

Open the local URL printed by Vite, typically:

```text
http://localhost:5173
```

Ensure the backend and MongoDB connection are running before testing application features.

##  Main API Endpoints

The following table summarizes the main API endpoints. Authentication requirements and supported operations should be checked against the current backend route definitions.

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/` | API health or status check |
| `POST` | `/api/auth/login` | Authenticate a user |
| `GET` | `/api/auth/users` | Retrieve system users |
| `GET` | `/api/substations` | Retrieve substations |
| `GET` | `/api/feeders` | Retrieve feeders |
| `GET` | `/api/transformers` | Retrieve transformers |
| `GET` | `/api/consumers` | Retrieve consumers |
| `GET` | `/api/smart-meters` | Retrieve smart meter records |
| `POST` | `/api/smart-meters` | Create a smart meter record |
| `PUT` | `/api/smart-meters/:id` | Update a smart meter record |
| `DELETE` | `/api/smart-meters/:id` | Delete a smart meter record |
| `GET` | `/api/outages` | Retrieve outage records |
| `POST` | `/api/outages` | Create an outage |
| `PUT` | `/api/outages/:id` | Update an outage |
| `DELETE` | `/api/outages/:id` | Delete an outage |
| `GET` | `/api/consumer-impact/:outageId` | Retrieve calculated outage impact |
| `GET` | `/api/reports/saidi` | Calculate SAIDI |
| `GET` | `/api/reports/saifi` | Calculate SAIFI |
| `GET` | `/api/tickets` | Retrieve maintenance tickets |
| `POST` | `/api/tickets` | Create a maintenance ticket |
| `PUT` | `/api/tickets/:id` | Update a maintenance ticket |
| `DELETE` | `/api/tickets/:id` | Delete a maintenance ticket |

For complete request formats, response examples, and implementation details, see [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md).

##  Testing and Verification

Run the frontend lint checks:

```bash
cd client
npm run lint
```

Run a production build:

```bash
npm run build
```

For the test plan, test cases, and recorded results, refer to [`TESTING.md`](TESTING.md).

A successful build or lint check does not by itself confirm that every API, permission rule, or end-to-end workflow is working correctly. Verify the application against the current code and database before deployment or submission.

##  Project Documentation

- [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md) — REST API endpoints and usage.
- [`DATABASE_SCHEMA.md`](DATABASE_SCHEMA.md) — MongoDB collections, fields, and relationships.
- [`TESTING.md`](TESTING.md) — Test plan and recorded validation results.
- [`USER_MANUAL.md`](USER_MANUAL.md) — Instructions for using the application.
- [`FINAL_PROJECT_REPORT.md`](FINAL_PROJECT_REPORT.md) — Project background, implementation, and outcomes.

##  Scope and Limitations

This version focuses on application-level outage management and analysis. The following are outside the current scope:

- Direct SCADA, RTU, or other hardware-protocol integration.
- Live communication with physical smart meters or AMI infrastructure.
- AI-based predictive fault forecasting.
- Native Android or iOS applications.
- Weather-based outage prediction and analytics.
- Automated remote load-shedding or smart meter control.

Reliability results depend on the quality and completeness of the available records. Socket.IO event broadcasting does not, by itself, guarantee that every screen automatically refreshes or stays synchronized.

Authentication and role-based UI restrictions should not be treated as proof of server-side authorization on every endpoint. Backend route permissions should be reviewed and verified separately.

##  Project Information

**Project:** Smart Grid Outage Management System (OMS)  
**Developer:** Gautami Chagantipati  
**Repository:** [github.com/gautami-04/OMS](https://github.com/gautami-04/OMS)

This project demonstrates the application of full-stack web development, GIS visualization, database modeling, outage workflow management, and reliability metric calculations to a power distribution management use case.
