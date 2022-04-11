import express from "express";

var router = express.Router();

router.get("/", (req, res) => {
  res.status(500).respond(99, "Not implemented yet", null);
});

router.get("/:id", (req, res) => {
  res.status(500).respond(99, "Not implemented yet", null);
});

router.post("/", (req, res) => {
  res.status(500).respond(99, "Not implemented yet", null);
});

router.put("/", (req, res) => {
  res.status(500).respond(99, "Not implemented yet", null);
});

router.delete("/", (req, res) => {
  res.status(500).respond(99, "Not implemented yet", null);
});

export default router;
