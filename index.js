const express = require("express");
const http = require("http");
const app = express();
const cors = require("cors");
const fs = require("fs");

const auth = require("./routes/auth");
const reclamation = require("./routes/reclamation");
const alert = require("./routes/alert");
const announce = require("./routes/announce");
const recomendation = require("./routes/recomendation");

app.use(cors({}));
app.use(express.json());

const server = http.createServer(app);

var cron = require("node-cron");

cron.schedule("0 8 * * *", () => {
  const jsonString = fs.readFileSync("../data.json", "utf-8");
  data = JSON.parse(jsonString);
  reclamations = data["reclamations"];
  dataToSend = {};
  reclamations.map((reclamation) => {
    date = new Date(Date.now() - 30 * (60 * 1000 * 60 * 24));
    if (reclamation["date"] > date) {
      if (dataToSend[reclamation["drug"]] != undefined) {
        dataToSend[reclamation["drug"]]["nbr"] += 1;
        dataToSend[reclamation["drug"]]["yes"] += reclamation["yes"];
        dataToSend[reclamation["drug"]]["no"] += reclamation["no"];
      } else {
        dataToSend[reclamation["drug"]] = {
          nbr: 1,
          yes: reclamation["yes"],
          no: reclamation["no"],
        };
      }
    }
    return reclamation;
  });
  console.log(dataToSend);
});

const port = process.env.PORT || 3000;
require("dotenv").config();

app.use("/auth", auth);
app.use("/alert", alert);
app.use("/reclamation", reclamation);
app.use("/recomendation", recomendation);
app.use("/announce", announce);

server.listen(port, () => console.log("listening on port " + port));
