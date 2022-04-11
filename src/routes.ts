import express from "express";
import ordersRouterV1 from "./routes/v1/orders.route"
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
router.use("/v1/orders", ordersRouterV1);
export default router;
