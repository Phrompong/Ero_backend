import express from "express";
import masterBanksRouterV1 from "./routes/v1/master.bank.route"
import customerStocksRouterV1 from "./routes/v1/customerStocks.route"
import rendersRouterV1 from "./routes/v1/renders.route"
import masterBrokersRouterV1 from "./routes/v1/master.brokers.route"
import customersRouterV1 from "./routes/v1/master.customers.route";
import ordersRouterV1 from "./routes/v1/orders.route";
import usersRouterV1 from "./routes/v1/users.route";
import authRouterV1 from "./routes/v1/auth.route";
import uploadsRouterV1 from "./routes/v1/uploads.route";

// Router imports
// End of router imports

const router = express.Router();

// Route routers
// End of routing routers

router.use("/v1/uploads", uploadsRouterV1);
router.use("/v1/auth", authRouterV1);
router.use("/v1/users", usersRouterV1);
router.use("/v1/orders", ordersRouterV1);
router.use("/v1/masterCustomers", customersRouterV1);
router.use("/v1/masterBrokers", masterBrokersRouterV1);
router.use("/v1/renders", rendersRouterV1);
router.use("/v1/customerStocks", customerStocksRouterV1);
router.use("/v1/masterBanks", masterBanksRouterV1);
export default router;
