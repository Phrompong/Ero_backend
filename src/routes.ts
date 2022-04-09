import express from "express";
import uploadsRouterV1 from "./routes/v1/uploads.route"

// Router imports
// End of router imports

const router = express.Router();

// Route routers
// End of routing routers

router.use("/v1/uploads", uploadsRouterV1);
export default router;
