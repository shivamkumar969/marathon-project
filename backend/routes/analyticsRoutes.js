const express = require("express");
const router = express.Router();

const {
  getAnalytics,
  getAiInsights,
  getPredictiveAnalytics
} = require(
  "../controllers/analyticsController"
);

router.get("/", getAnalytics);
router.get("/ai-insights", getAiInsights);
router.get("/predictive", getPredictiveAnalytics);

module.exports = router;