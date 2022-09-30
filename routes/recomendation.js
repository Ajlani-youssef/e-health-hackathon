const express = require("express");
const router = express.Router();
const jwt_decode = require("jwt-decode");
const fs = require("fs");

router.put("/update-recomendation", verifyToken, async (req, res) => {
  const { recomendationId, drug } = req.body;

  try {
    const user = jwt_decode(req.token).user;
    if (user["role"] != "ineas") {
      return res.sendStatus(403);
    }
    const jsonString = fs.readFileSync("../data.json", "utf-8");
    data = JSON.parse(jsonString);
    recomendations = data["recomendations"];
    recomendations = recomendations.map((recomendation) => {
      if (recomendation["id"] === recomendationId) {
        return { ...recomendation, drug };
      }
      return recomendation;
    });

    data["recomendations"] = recomendations;
    fs.writeFileSync("../data.json", JSON.stringify(data));
    return res.sendStatus(200);
  } catch (err) {
    return res.status(409).json({
      success: false,
      msg: "sorry there's a problem. please try again",
    });
  }
});

router.post("/add-recomendation", verifyToken, async (req, res) => {
  const { disease, drug, description } = req.body;

  try {
    const user = jwt_decode(req.token).user;
    if (user["role"] != "ineas") {
      return res.sendStatus(403);
    }
    const jsonString = fs.readFileSync("../data.json", "utf-8");
    data = JSON.parse(jsonString);
    recomendations = data["recomendations"];
    if (recomendations === undefined) recomendations = [];

    id =
      recomendations.length === 0
        ? 0
        : recomendations[recomendations.length - 1]["id"] + 1;

    recomendation = {
      id: id,
      sender: user["id"],
      senderRole: user["role"],
      date: Date.now(),
      drug: drug,
      description: description,
      disease: disease,
    };
    recomendations.push(recomendation);
    data["recomendations"] = recomendations;
    fs.writeFileSync("../data.json", JSON.stringify(data));
    return res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return res.status(409).json({
      success: false,
      msg: "sorry there's a problem. please try again",
    });
  }
});

router.post("/recomendations", verifyToken, async (req, res) => {
  try {
    const jsonString = fs.readFileSync("../data.json", "utf-8");
    data = JSON.parse(jsonString);
    recomendations = data["recomendations"];
    return res.status(200).json({ data: recomendations });
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
