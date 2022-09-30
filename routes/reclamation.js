const express = require("express");
const router = express.Router();
const jwt_decode = require("jwt-decode");
const fs = require("fs");

router.post("/add-reclamation", verifyToken, async (req, res) => {
  const { drug } = req.body;

  try {
    const user = jwt_decode(req.token).user;
    if (
      user["role"] != "pharmacy" &&
      user["role"] != "grossiste" &&
      user["role"] != "doctor"
    ) {
      return res.sendStatus(403);
    }
    const jsonString = fs.readFileSync("../data.json", "utf-8");
    data = JSON.parse(jsonString);
    reclamations = data["reclamations"];
    if (reclamations === undefined) reclamations = [];
    id =
      reclamations.length === 0
        ? 0
        : reclamations[reclamations.length - 1]["id"] + 1;

    reclamation = {
      id: id,
      sender: user["id"],
      senderRole: user["role"],
      date: Date.now(),
      yes: 0,
      no: 0,
      drug: drug,
    };
    reclamations.push(reclamation);
    data["reclamations"] = reclamations;
    fs.writeFileSync("../data.json", JSON.stringify(data));
    csv = `\r\n${drug},${Date.now()},${user["localisation"]},${user["role"]}`;
    fs.appendFileSync("../reclamation-logs.csv", csv);
    return res.sendStatus(200);
  } catch (err) {
    return res.status(409).json({
      success: false,
      msg: "sorry there's a problem. please try again",
    });
  }
});

router.post("/respond", verifyToken, async (req, res) => {
  const { reclamationId, response } = req.body;

  try {
    const user = jwt_decode(req.token).user;
    if (user["role"] != "grossiste") {
      return res.sendStatus(403);
    }
    const jsonString = fs.readFileSync("../data.json", "utf-8");
    data = JSON.parse(jsonString);
    reclamations = data["reclamations"];
    reclamations = reclamations.map((reclamation) => {
      if (reclamation["id"] === reclamationId) {
        if (response) {
          yes = reclamation["yes"] + 1;
          return { ...reclamation, yes };
        } else {
          no = reclamation["no"] + 1;
          return { ...reclamation, no };
        }
      }
      return reclamation;
    });

    data["reclamations"] = reclamations;
    fs.writeFileSync("../data.json", JSON.stringify(data));
    return res.sendStatus(200);
  } catch (err) {
    return res.status(409).json({
      success: false,
      msg: "sorry there's a problem. please try again",
    });
  }
});

router.post("/reclamations", verifyToken, async (req, res) => {
  try {
    const jsonString = fs.readFileSync("../data.json", "utf-8");
    data = JSON.parse(jsonString);
    reclamations = data["reclamations"];
    return res.status(200).json({ data: reclamations });
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
