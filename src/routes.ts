import express from "express";
import usersRouterV1 from "./routes/v1/users.route"
import authRouterV1 from "./routes/v1/auth.route"
import uploadsRouterV1 from "./routes/v1/uploads.route"

// Router imports
// End of router imports

const router = express.Router();

// Route routers
// End of routing routers

router.use("/v1/uploads", uploadsRouterV1);
router.use("/v1/auth", authRouterV1);
router.use("/v1/users", usersRouterV1);
export default router;
