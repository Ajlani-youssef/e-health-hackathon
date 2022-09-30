const express = require("express");
const router = express.Router();
const jwt_decode = require("jwt-decode");
const fs = require("fs");

router.post("/add-announce", verifyToken, async (req, res) => {
  const { title, description } = req.body;

  try {
    const user = jwt_decode(req.token).user;
    if (
      user["role"] != "admin" &&
      user["role"] != "spot" &&
      user["role"] != "cnopt"
    ) {
      return res.sendStatus(403);
    }
    const jsonString = fs.readFileSync("../data.json", "utf-8");
    data = JSON.parse(jsonString);
    announcements = data["announcements"];
    if (announcements === undefined) announcements = [];
    id =
      announcements.length === 0
        ? 0
        : announcements[announcements.length - 1]["id"] + 1;

    announce = {
      id: id,
      sender: user["id"],
      senderRole: user["role"],
      date: Date.now(),
      title: title,
      description: description,
    };
    announcements.push(announce);
    data["announcements"] = announcements;
    fs.writeFileSync("../data.json", JSON.stringify(data));
    return res.sendStatus(200);
  } catch (err) {
    return res.status(409).json({
      success: false,
      msg: "sorry there's a problem. please try again",
    });
  }
});

router.post("/announcements", verifyToken, async (req, res) => {
  try {
    const jsonString = fs.readFileSync("../data.json", "utf-8");
    data = JSON.parse(jsonString);
    announcements = data["announcements"];
    return res.status(200).json({ data: announcements });
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
