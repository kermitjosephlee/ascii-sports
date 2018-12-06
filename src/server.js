const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

const https = require("https");
const fetch = require("node-fetch");
const base64 = require("base-64");
const morgan = require("morgan");
const apiKey = process.env.API_KEY;
const password = process.env.PASSWORD;
const differenceInDays = require("date-fns/difference_in_days");
const util = require("./utilities.js");

//********************************************

const activeGameChecker = (
  gameStatus,
  startTime,
  currentQuarter,
  currentQuarterSecondsRemaining
) => {
  return gameStatus === "UNPLAYED"
    ? util.gameDateMaker(startTime)
    : gameStatus === "LIVE"
    ? currentQuarter +
      "Q" +
      "  " +
      util.timeConverter(currentQuarterSecondsRemaining)
    : "Final";
};

const scoreStringMaker = json => {
  const { games, teamsWithByes } = json;
  let scoreStr = "";
  for (i in games) {
    const {
      schedule: {
        awayTeam: { abbreviation: awayTeam },
        homeTeam: { abbreviation: homeTeam },
        playedStatus,
        startTime
      },
      score: {
        awayScoreTotal,
        homeScoreTotal,
        currentQuarter,
        currentQuarterSecondsRemaining,
        currentDown,
        currentYardsRemaining,
        teamInPossession
      }
    } = games[i];

    scoreStr =
      `${scoreStr}` +
      `${util.possessionAway(
        teamInPossession,
        awayTeam
      )} ${util.nameLengthChecker(awayTeam)} ${util.scoreChecker(
        awayScoreTotal
      )} - ${util.scoreChecker(homeScoreTotal)} ${util.nameLengthChecker(
        homeTeam
      )} ${util.possessionHome(teamInPossession, homeTeam)} ${activeGameChecker(
        playedStatus,
        startTime,
        currentQuarter,
        currentQuarterSecondsRemaining
      )} ${util.downAndYardsMaker(currentDown, currentYardsRemaining)}${"\n"}`;
  }

  return scoreStr + `${util.teamsWithByesPrinter(teamsWithByes)} \n`;
};

//********************************************
const currentWeek = Math.round(
  (differenceInDays(new Date(), new Date(2018, 8, 2)) + 0.5) / 7
);

const url = `https://api.mysportsfeeds.com/v2.0/pull/nfl/current/week/${currentWeek}/games.json`;
const encoded = base64.encode(`${apiKey}:${password}`);
const auth = { headers: { Authorization: `Basic ${encoded}` } };

//********************************************

app.use(morgan("combined"));

app.get("/", (req, res) => {
   fetch(url, auth)
  .then(body => {
    return body.json();
  })
  .then(json => {
    const scoreString = scoreStringMaker(json);
    res.send(scoreString);
  })
  .catch(error => console.error("*** Fetch Error ***", error));
});

console.log(
  `Server is listening on localhost:${PORT}${"\n"}Started at ${new Date()}`
);
app.listen(PORT);
