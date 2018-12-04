const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
const https = require("https");
const url = "https://api.mysportsfeeds.com/v2.0/pull/nfl";
const request = require("request");
const rp = require("request-promise");
const moment = require("moment");
const morgan = require("morgan");
const apiKey = process.env.API_KEY;
const password = process.env.PASSWORD;

app.set("view engine", "ejs");

//********************************************

const queryUrlBuilder = url => {
  const currentNFLYear = moment().get("year");
  const dayOfWeek = moment().day();

  const seasonType = () => {
    return moment().get("year") === 2018 ? "regular" : "playoff";
  };

  const weekNumberBuilder = () => {
    return currentNFLYear === 2018 && dayOfWeek > 3
      ? moment().get("week") - 35
      : currentNFLYear === 2018 && dayOfWeek <= 3
        ? moment().get("week") - 36
        : currentNFLYear === 2019 && dayOfWeek > 3
          ? moment().get("week") + 1
          : moment().get("week") + 1;
  };

  let weekObj = {
    currentNFLYear: moment().get("year"),
    seasonType: seasonType(),
    currentNFLWeek: weekNumberBuilder()
  };
  return (
    url +
    `/${weekObj.currentNFLYear}-${weekObj.seasonType}/week/${
      weekObj.currentNFLWeek
    }/games.json`
  );
};

//********************************************

const asciiMapper = ({ games, teamsWithByes }) => {
  games.forEach(gameHandler);
  console.log(`+----------------------+`);
  console.log("On Byes: ", teamsWithByesPrinter(teamsWithByes));
};

const nameLengthChecker = name => {
  if (name === "LA") {
    return "LAR  ";
  }
  return name.length === 2 ? name + "   " : name + "  ";
};

const scoreChecker = score => {
  return score === null
    ? " 0"
    : score.toString().length === 1
      ? " " + score
      : score;
};

const activeGameChecker = (
  gameStatus,
  startTime,
  currentQuarter,
  currentQuarterSecondsRemaining
) => {
  return gameStatus === "UNPLAYED"
    ? gameDateMaker(startTime)
    : gameStatus === "LIVE"
      ? currentQuarter +
        "Q" +
        "  " +
        timeConverter(currentQuarterSecondsRemaining)
      : "Final";
};

const gameDateMaker = date => {
  return moment(date)
    .format("ddd ha")
    .toLowerCase();
};

const downOrdinalMaker = (currentDown, yardsRemaining) => {
  return currentDown === 1
    ? currentDown + "st & " + yardsRemaining
    : currentDown === 2
      ? currentDown + "nd & " + yardsRemaining
      : currentDown === 3
        ? currentDown + "rd & " + yardsRemaining
        : currentDown === 4
          ? currentDown + "th & " + yardsRemaining
          : currentDown === 0
            ? "intermission"
            : "";
};

const timeConverter = currentQuarterSecondsRemaining => {
  const minutes = currentQuarterSecondsRemaining / 60;
  let seconds = currentQuarterSecondsRemaining % 60;
  seconds < 10 ? (seconds = `0${seconds}`) : seconds;
  return `${Math.trunc(minutes)}:${seconds}`;
};

const downAndYardsMaker = (currentDown, yardsRemaining) => {
  return currentDown !== null
    ? `${downOrdinalMaker(currentDown, yardsRemaining)}`
    : "";
};

const teamsWithByesPrinter = teamsWithByes => {
  return teamsWithByes ? teamsWithByes.map(x => x.abbreviation).toString() : "";
};

const possessionAway = (possession, awayTeam) => {
  const teamPoss = possession && possession.abbreviation;
  return teamPoss === awayTeam ? String.fromCharCode(187) : " ";
};

const possessionHome = (possession, homeTeam) => {
  const teamPoss = possession && possession.abbreviation;
  return teamPoss === homeTeam ? String.fromCharCode(187) : " ";
};

const gameHandler = game => {
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
  } = game;

  console.log(`+----------------------+`);
  console.log(
    " " +
      possessionAway(teamInPossession, awayTeam) +
      " " +
      nameLengthChecker(awayTeam) +
      scoreChecker(awayScoreTotal) +
      "   " +
      activeGameChecker(
        playedStatus,
        startTime,
        currentQuarter,
        currentQuarterSecondsRemaining
      )
  );
  console.log(
    " " +
      possessionHome(teamInPossession, homeTeam) +
      " " +
      nameLengthChecker(homeTeam) +
      scoreChecker(homeScoreTotal) +
      "   " +
      downAndYardsMaker(currentDown, currentYardsRemaining)
  );
};

//********************************************
const testQuery = "https://api.mysportsfeeds.com/v2.0/pull/nfl/2018-regular/games.json"

let query = rp.get(testQuery, {
  auth: {
    user: apiKey,
    pass: password,
    sendImmediately: true
  }
});

const mySportsFeedsApiCall = async query => {

  try {
    let result = await rp(query);

    let storage = JSON.stringify(result.trim())
    console.log(JSON.parse(storage))
    asciiMapper(JSON.parse(storage));
  }
  catch (e) {
    return console.error("*** ERROR in Node Server Async Call ***", e);
  }
};

mySportsFeedsApiCall(query);

//********************************************

app.use(morgan("combined"));

app.get("/", (req, res) => {
  res.send(mySportsFeedsApiCall(query));
});

console.log(`Server is listening on localhost:${PORT}`);
app.listen(PORT);
