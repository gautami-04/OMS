# Smart Grid Outage Management System (OMS)

Full-stack web-based **Smart Grid Outage Management System (OMS)** designed for electrical distribution utilities. The system enables geospatial grid monitoring, planned outage lifecycle management, automated consumer impact analysis, field crew ticketing, IEEE 1366 reliability performance calculation (SAIFI & SAIDI), and role-based operational workflows.

---

## ⚡ Problem Statement & Overview

Modern electrical power distribution networks require instantaneous visibility into network disruptions, planned maintenance schedules, and equipment status across multi-tiered topologies (Substations $\rightarrow$ Feeders $\rightarrow$ Transformers $\rightarrow$ Consumers $\rightarrow$ Smart Meters).

Traditional utility management suffers from fragmented records, delayed impact calculation, and manual reliability index calculation. This Smart Grid OMS delivers a centralized operations hub providing:
- Geospatial mapping of grid topology and fault perimeters.
- Automated downstream consumer and asset impact tracing when outages occur.
- Exact IEEE 1366 grid reliability calculations (SAIDI and SAIFI) computed directly against recorded operational data.
- Incident ticketing and field engineer dispatch workflows.
- Outage event broadcasting using Socket.IO.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
|---|---|---|
| **Frontend Framework** | React 19 (Vite) | Single Page Application with React Router v7 |
| **GIS / Mapping** | Leaflet & React-Leaflet | Interactive MapTiler tile layers, custom SVG/DivIcon markers, dynamic impact radii |
| **Styling & Design** | Modern CSS Design System | Curated utility palette, glassmorphism, responsive data cards, accessibility |
| **Icons** | Lucide React | Modern SVG icons |
| **Backend Runtime** | Node.js & Express.js | RESTful API server with modular controllers & routers |
| **Database** | MongoDB Atlas / Mongoose ODM | Relational schema modeling with references and population |
| **Authentication** | JSON Web Tokens (JWT) & bcryptjs | Stateless authorization with role-based access control (RBAC) |
| **Real-Time Engine** | Socket.IO (v4) | Outage event broadcasting (`outage:changed`) |

---

## 📦 System Modules

1. **Authentication & RBAC**: Secure JWT-based login supporting `Administrator`, `Operator`, and `Field Engineer` roles.
2. **Operations Dashboard**: Executive overview featuring grid health status, key performance counters, mini GIS map, and active outages.
3. **GIS Grid Map**: Interactive spatial network view supporting layer toggles (Substations, Feeders, Transformers, Consumers, Smart Meters, Active Outages), asset search with map fly-to, and visual fault blast zones.
4. **Planned Outage Management**: End-to-end outage lifecycle tracking across `Scheduled`, `In Progress`, and `Restored` states.
5. **Asset Registry**: Centralized inventory of grid infrastructure with Smart meter status and recorded electrical readings and CRUD operations on Smart Meters.
6. **Consumer Impact Analysis**: Automated topological graph traversal that identifies all downstream transformers, feeders, and consumers interrupted by an outage.
7. **Crew & Incident Tickets**: Field engineer dispatch management, ticket status transitions (`Open`, `In Progress`, `Resolved`), and outage linking.
8. **Reliability Analysis (IEEE 1366)**: Automated computation of **SAIDI** and **SAIFI** indices computed from database outage duration and customer counts.
9. **Reports & Analytics**: Operational reporting center with report compilation forms, grid reliability previews, and export workflows.
10. **User Management**: Administrator-restricted portal for viewing system accounts and role assignments.
11. **Socket.IO Real-Time Updates**: Outage event broadcasting using Socket.IO across connected operator screens.

---

## 📐 Reliability Formulations (IEEE 1366)

The system computes grid reliability performance metrics in accordance with the IEEE 1366 standard:

### 1. System Average Interruption Duration Index (SAIDI)
Measures the total duration of interruption for the average customer served during a specified period (in hours/customer):

$$\text{SAIDI} = \frac{\sum (N_i \times U_i)}{N_T}$$

Where:
- $N_i$ = Number of affected consumers for outage $i$
- $U_i$ = Outage duration in hours ($(\text{endTime} - \text{startTime}) / 3600000$)
- $N_T$ = Total number of consumers registered in the grid database

### 2. System Average Interruption Frequency Index (SAIFI)
Measures the average number of sustained interruptions that a customer experiences (in interruptions/customer):

$$\text{SAIFI} = \frac{\sum N_i}{N_T}$$

Where:
- $N_i$ = Number of affected consumers for outage $i$
- $N_T$ = Total number of consumers registered in the grid database

*Note: Outages with non-positive or invalid durations are safely excluded from indices calculation.*

---

## 📁 Project Structure

```
Smart-grid-oms/
├── client/                      # React frontend application (Vite)
│   ├── public/                  # Public assets
│   ├── src/
│   │   ├── assets/              # Static styling assets
│   │   ├── components/          # Reusable UI components (DataTable, Modal, StatCard, etc.)
│   │   ├── pages/               # Application route views (Dashboard, GridMap, Outages, etc.)
│   │   ├── services/            # API client (api.js) and Socket.IO client (socket.js)
│   │   ├── App.css              # Design system styling & CSS variables
│   │   ├── App.jsx              # Routing & role protection logic
│   │   ├── index.css            # Base typography & layout styles
│   │   └── main.jsx             # React DOM entry point
│   ├── .env                     # Frontend environment variables
│   ├── package.json             # Frontend dependencies and scripts
│   └── vite.config.js           # Vite configuration
│
├── server/                      # Node.js Express backend API
│   ├── config/
│   │   └── db.js                # MongoDB Mongoose connection handler
│   ├── controllers/             # Business logic controllers
│   │   ├── authController.js
│   │   ├── consumerController.js
│   │   ├── consumerImpactController.js
│   │   ├── feederController.js
│   │   ├── outageController.js
│   │   ├── reliabilityController.js
│   │   ├── smartMeterController.js
│   │   ├── substationController.js
│   │   ├── ticketController.js
│   │   └── transformerController.js
│   ├── middleware/
│   │   └── authMiddleware.js    # JWT verification & role authorization
│   ├── models/                  # Mongoose schema models
│   │   ├── Consumer.js
│   │   ├── Feeder.js
│   │   ├── PlannedOutage.js
│   │   ├── SmartMeter.js
│   │   ├── Substation.js
│   │   ├── Ticket.js
│   │   ├── Transformer.js
│   │   └── User.js
│   ├── routes/                  # Express route definitions
│   │   ├── authRoutes.js
│   │   ├── consumerImpactRoutes.js
│   │   ├── consumerRoutes.js
│   │   ├── feederRoutes.js
│   │   ├── outageRoutes.js
│   │   ├── reportRoutes.js
│   │   ├── smartMeterRoutes.js
│   │   ├── substationRoutes.js
│   │   ├── ticketRoutes.js
│   │   └── transformerRoutes.js
│   ├── seedData.js              # Grid assets & smart meters seeder
│   ├── seedUser.js              # Administrator account seeder
│   ├── seedFieldEngineer.js     # Field Engineer account seeder
│   ├── server.js                # Express & Socket.IO server entrypoint
│   ├── .env                     # Backend environment configuration
│   └── package.json             # Backend dependencies and scripts
│
├── API_DOCUMENTATION.md         # Comprehensive REST API specifications
├── TESTING.md                   # Full test plan, test cases & validation results
└── README.md                    # Project documentation
```

---

## ⚙️ Prerequisites

Before running the application locally, ensure you have:
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Access to a MongoDB Atlas cluster or a local MongoDB instance (`mongodb://localhost:27017/oms`)

---

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/gautami-04/OMS.git
cd OMS
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create or verify `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/oms
JWT_SECRET=your_super_secret_jwt_key
```

Seed initial database users and grid topology:
```bash
node seedUser.js
node seedFieldEngineer.js
node seedData.js
```

Start the backend API server:
```bash
npm start
# Server will run at http://localhost:5000
```

### 3. Frontend Setup
Open a new terminal window:
```bash
cd client
npm install
```

Create or verify `client/.env`:
```env
VITE_MAPTILER_KEY=your_maptiler_api_key
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
# Application will run at http://localhost:5173
```

---

## 🔐 Default Credentials

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Administrator** | `admin@oms.com` | `Admin@123` | Full access across all modules, including User Management |
| **Field Engineer** | `engineer@oms.com` | `Engineer@123` | Operational access to grid map, outages, crew tickets, assets |

---

## 📡 Main API Endpoints Summary

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/` | Public | System status and API health check |
| `POST` | `/api/auth/login` | Public | Authenticate user & issue JWT token |
| `GET` | `/api/auth/users` | Admin / Protected | List registered system users |
| `GET` | `/api/substations` | Protected | Fetch grid substations |
| `GET` | `/api/feeders` | Protected | Fetch feeder lines |
| `GET` | `/api/transformers` | Protected | Fetch distribution transformers |
| `GET` | `/api/consumers` | Protected | Fetch registered consumers |
| `GET` | `/api/smart-meters` | Protected | Fetch smart meters and recorded electrical readings |
| `POST` | `/api/smart-meters` | Protected | Register a new smart meter |
| `PUT` | `/api/smart-meters/:id` | Protected | Update smart meter recorded readings / status |
| `DELETE`| `/api/smart-meters/:id` | Protected | Delete smart meter |
| `GET` | `/api/outages` | Protected | Fetch planned outage records |
| `POST` | `/api/outages` | Protected | Create a new planned outage |
| `PUT` | `/api/outages/:id` | Protected | Update outage state (`Scheduled` $\rightarrow$ `In Progress` $\rightarrow$ `Restored`) |
| `DELETE`| `/api/outages/:id` | Protected | Delete planned outage |
| `GET` | `/api/consumer-impact/:outageId` | Protected | Compute affected consumers, feeders, and transformers |
| `GET` | `/api/reports/saidi` | Protected | Calculate SAIDI reliability metric |
| `GET` | `/api/reports/saifi` | Protected | Calculate SAIFI reliability metric |
| `GET` | `/api/tickets` | Protected | Fetch crew maintenance tickets |
| `POST` | `/api/tickets` | Protected | Create maintenance ticket |
| `PUT` | `/api/tickets/:id` | Protected | Update maintenance ticket |
| `DELETE`| `/api/tickets/:id` | Protected | Delete maintenance ticket |

---

## Out of Scope

The following capabilities are outside the scope of this project:

- SCADA integration
- Physical AMI/smart-meter telemetry integration
- AI/ML-based fault prediction
- Mobile application
- Weather analytics
- Automated remote load shedding
- Remote control of physical grid equipment

---

## 🧪 Testing & Verification

Run frontend linting:
```bash
cd client
npm run lint
```

Run frontend production build:
```bash
cd client
npm run build
```

*For complete test execution reports, test matrices, and edge-case results, see [`TESTING.md`](file:///c:/Users/gauti/Desktop/Smart-grid-oms/TESTING.md).*
