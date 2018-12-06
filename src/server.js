const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
const https = require("https");
const request = require("request");
const rp = require("request-promise");
const fetch = require("node-fetch");
const base64 = require("base-64");

const morgan = require("morgan");
const apiKey = process.env.API_KEY;
const password = process.env.PASSWORD;
const testObj = JSON.parse(process.env.TEST_OBJ);

const differenceInDays = require("date-fns/difference_in_days");
const format = require("date-fns/format");

// console.log(testObj);

app.set("view engine", "ejs");

//********************************************

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
  return format(date, "ddd ha");
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
  return teamsWithByes
    ? `${teamsWithByes.map(x => x.abbreviation).toString()}`
    : "teams with byes";
};

const possessionAway = (possession, awayTeam) => {
  const teamPoss = possession && possession.abbreviation;
  return teamPoss === awayTeam ? String.fromCharCode(187) : " ";
};

const possessionHome = (possession, homeTeam) => {
  const teamPoss = possession && possession.abbreviation;
  return teamPoss === homeTeam ? String.fromCharCode(187) : " ";
};

// takes the JSON object from mySportsFeedsApiCall, object destructures games and teamsWithByes from the obj
// and loops gameHandler function on it to return a long string called result
const asciiMapper = jsonObj => {
  const { games, teamsWithByes } = jsonObj;
  // return new Promise((resolve, reject) => {
  //   const resultStr = games.forEach(gameHandler);
  //   resolve(resultStr);
  // });
  //   return console.log("jsonObj: ", jsonObj);
  // };

  // const result = games.forEach(gameHandler);
  return games;
};

// takes an object called game from asciiMapper and destructures the appropriate variables from the object
const gameHandler = games => {
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

    scoreStr = `awayTeam: ${awayTeam}${"\n"}` + `${scoreStr}`;
  }
  return scoreStr;
};

//********************************************
const currentWeek = Math.round(
  (differenceInDays(new Date(), new Date(2018, 8, 2)) + 0.5) / 7
);

const url = `https://api.mysportsfeeds.com/v2.0/pull/nfl/current/week/${currentWeek}/games.json`;
const encoded = base64.encode(`${apiKey}:${password}`);
const auth = { headers: { Authorization: `Basic ${encoded}` } };

fetch(url, auth)
  .then(result => result.json())
  .then(json => asciiMapper(json))
  .then(mapperReturn => gameHandler(mapperReturn))
  .then(handlerReturn => console.log(handlerReturn))
  .catch(error => console.error("*** Fetch Error ***", error.message));

// const query = rp.get(url, {
//   auth: {
//     user: apiKey,
//     pass: password,
//     sendImmediately: true
//   }
// });
//
// const mySportsFeedsApiCall = async query => {
//   try {
//     const result = await rp(query);
//     const storage = await JSON.parse(result.replace(/\\"/g, '"'));
//     const asciiMap = await asciiMapper(storage);
//     console.log(asciiMap);
//     return;
//   } catch (e) {
//     console.error("*** ERROR in Node Server Async Call ***", e);
//   }
// };

// test rendering in server window
// mySportsFeedsApiCall(query);

//********************************************

app.use(morgan("combined"));

app.get("/", (req, res) => {
  res.send(asciiMapper(testObj));
  // mySportsFeedsApiCall(query).then(result => res.send(result));
});

console.log(`Server is listening on localhost:${PORT}`);
app.listen(PORT);
