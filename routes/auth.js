const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const jwt_decode = require("jwt-decode");
const fs = require("fs");

router.post("/signin", (req, res) => {
  const { email, password } = req.body;
  const jsonString = fs.readFileSync("../data.json", "utf-8");
  data = JSON.parse(jsonString);
  users = data["users"];

  user = users.find((element) => element["email"] === email);
  if (user === undefined) {
    return res.status(404).json({
      success: false,
      msg: "email not found!",
    });
  } else {
    bcrypt.compare(password, user["password"]).then((isMatch) => {
      if (!isMatch) {
        return res
          .status(200)
          .json({ success: false, msg: "incorrecte password" });
      } else {
        const token = jwt.sign({ user }, "key");
        return res
          .status(200)
          .json({ success: true, token: token, user: user["role"] });
      }
    });
  }
});

router.post("/signup", async (req, res) => {
  const { userName, email, password, role, photo, location } = req.body;

  try {
    const jsonString = fs.readFileSync("../data.json", "utf-8");
    data = JSON.parse(jsonString);
    users = data["users"];
    const cryptedPassword = await bcrypt.hash(password, 10);
    const olduser = users.some((e) => e["email"] === email);
    if (olduser) {
      return res
        .status(200)
        .json({ success: false, msg: "email already exists !" });
    }
    id = users.length === 0 ? 0 : users[users.length - 1]["id"] + 1;
    const user = {
      id: id,
      userName: userName,
      email: email,
      password: cryptedPassword,
      role: role,
      photo: photo,
      localisation: location,
    };
    users.push(user);
    data["users"] = users;
    fs.writeFileSync("../data.json", JSON.stringify(data));
    const token = jwt.sign({ user }, "key");
    return res.status(200).json({ success: true, token: token, role });
  } catch (err) {
    return res.status(409).json({
      success: false,
      msg: "sorry there's a problem. please try again",
    });
  }
});

// router.post("/changepassword", verifyToken, async (req, res) => {
//   const { oldPassword, newPassword } = req.body;
//   const decoded = jwt_decode(req.token);
//   try {
//     const userToChange = await User.findOne({
//       where: { email: decoded.user.email },
//     });
//     bcrypt.compare(oldPassword, userToChange.password).then((isMatch) => {
//       if (!isMatch) {
//         return res.status(200).json({ success: false, msg: "wrong password" });
//       } else {
//         bcrypt.hash(newPassword, 10).then(async (password) => {
//           await User.update(
//             { password },
//             {
//               where: {
//                 email: userToChange.email,
//               },
//             }
//           );
//           return res.status(200).json({ success: true });
//         });
//       }
//     });
//   } catch (error) {
//     return res.status(409).json({
//       success: false,
//       msg: "sorry there's a problem. please try again",
//     });
//   }
// });

// function verifyToken(req, res, next) {
//   const bearerHeader = req.headers["authorization"];
//   if (typeof bearerHeader !== "undefined") {
//     const token = bearerHeader.split(" ")[1];
//     req.token = token;
//     next();
//   } else {
//     res.sendStatus(403);
//   }
// }

module.exports = router;
