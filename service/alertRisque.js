var request = require("request");

async function getReclamationRisque({
  medicament,
  datereclamation,
  region,
  source,
}) {
  var clientServerOptions = {
    uri: "https://9d08-196-203-237-137.eu.ngrok.io/predict",
    body: JSON.stringify({
      medicament,
      datereclamation,
      region,
      source,
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  };
  request(clientServerOptions, function (error, response) {
    if (response.body) {
      return JSON.parse(response.body)["prediction"];
    } else {
      return;
    }
  });
}

module.exports = { getReclamationRisque };
