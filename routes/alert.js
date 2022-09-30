const express = require("express");
const router = express.Router();
const jwt_decode = require("jwt-decode");
const fs = require("fs");

router.post("/send-alert", verifyToken, async (req, res) => {
  const { drug, description } = req.body;

  try {
    const user = jwt_decode(req.token).user;
    if (
      user["role"] != "admin" &&
      user["role"] != "central-pharmacy" &&
      user["role"] != "cnip"
    ) {
      return res.sendStatus(403);
    }
    const jsonString = fs.readFileSync("../data.json", "utf-8");
    data = JSON.parse(jsonString);
    alerts = data["alerts"];
    if (alerts === undefined) alerts = [];
    id = alerts.length === 0 ? 0 : alerts[alerts.length - 1]["id"] + 1;

    breakAlert = {
      id: id,
      sender: user["id"],
      senderRole: user["role"],
      date: Date.now(),
      drug: drug,
      description: description,
    };
    alerts.push(breakAlert);
    data["alerts"] = alerts;
    fs.writeFileSync("../data.json", JSON.stringify(data));
    csv = `\r\npost,${drug},${Date.now()}`;
    fs.appendFileSync("../alert_logs.csv", csv);
    return res.sendStatus(200);
  } catch (err) {
    return res.status(409).json({
      success: false,
      msg: "sorry there's a problem. please try again",
    });
  }
});

router.delete("/remove-alert", verifyToken, async (req, res) => {
  const { drug } = req.body;

  try {
    const user = jwt_decode(req.token).user;
    if (
      user["role"] != "admin" &&
      user["role"] != "central-pharmacy" &&
      user["role"] != "cnip"
    ) {
      return res.sendStatus(403);
    }
    const jsonString = fs.readFileSync("../data.json", "utf-8");
    data = JSON.parse(jsonString);
    alerts = data["alerts"];
    for (var i = 0; i < alerts.length; i++) {
      if (alerts[i]["drug"] === drug) {
        alerts.splice(i, 1);
      }
    }
    data["alerts"] = alerts;
    fs.writeFileSync("../data.json", JSON.stringify(data));
    csv = `\r\ndelete,${drug},${Date.now()}`;
    fs.appendFileSync("../alert_logs.csv", csv);
    return res.sendStatus(200);
  } catch (err) {
    return res.status(409).json({
      success: false,
      msg: "sorry there's a problem. please try again",
    });
  }
});

router.post("/alerts", verifyToken, async (req, res) => {
  try {
    const jsonString = fs.readFileSync("../data.json", "utf-8");
    data = JSON.parse(jsonString);
    alerts = data["alerts"];
    return res.status(200).json({ data: alerts });
  } catch (err) {
    return res.status(409).json({
      success: false,
      msg: "sorry there's a problem. please try again",
    });
  }
});

function verifyToken(req, res, next) {
  const bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== "undefined") {
    const token = bearerHeader.split(" ")[1];
    req.token = token;
    next();
  } else {
    return res.sendStatus(403);
  }
}

module.exports = router;
