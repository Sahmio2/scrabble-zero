import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { registerGameSockets } from "./sockets/gameSocket";
import authRoutes from "./routes/authRoutes";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }
});

registerGameSockets(io);

httpServer.listen(4000, () => {
  console.log("server running on port 4000");
});
