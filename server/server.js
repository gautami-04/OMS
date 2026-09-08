const express = require("express");
const http = require("http");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const substationRoutes = require("./routes/substationRoutes");
const feederRoutes = require("./routes/feederRoutes");
const transformerRoutes = require("./routes/transformerRoutes");
const consumerRoutes = require("./routes/consumerRoutes");
const outageRoutes = require("./routes/outageRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const smartMeterRoutes = require("./routes/smartMeterRoutes");
const consumerImpactRoutes = require("./routes/consumerImpactRoutes");

const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.set("io", io);

connectDB();

app.use(cors());
app.use(express.json());

io.on("connection", (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Smart Grid OMS API is running!",
  });
});

app.use("/api/substations", substationRoutes);
app.use("/api/feeders", feederRoutes);
app.use("/api/transformers", transformerRoutes);
app.use("/api/consumers", consumerRoutes);
app.use("/api/smart-meters", smartMeterRoutes);
app.use("/api/outages", outageRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/consumer-impact", consumerImpactRoutes);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});