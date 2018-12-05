const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;
const https = require("https");
const request = require("request");
const rp = require("request-promise");
const morgan = require("morgan");
const apiKey = process.env.API_KEY;
const password = process.env.PASSWORD;

const differenceInCalendarISOWeeks = require("date-fns/difference_in_calendar_iso_weeks");
const format = require("date-fns/format");

let outputString = " *** nothing yet *** ";

app.set("view engine", "ejs");

//********************************************

const asciiMapper = ({ games, teamsWithByes }) => {
  return `${games.forEach(gameHandler)} **** ${teamsWithByesPrinter(
    teamsWithByes
  )}`;
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
    : "";
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

  const scoreStr = `+----------------------+${"\n"}  ${possessionAway(
    teamInPossession,
    awayTeam
  )} ${nameLengthChecker(awayTeam)} ${scoreChecker(
    awayScoreTotal
  )}   ${activeGameChecker(
    playedStatus,
    startTime,
    currentQuarter,
    currentQuarterSecondsRemaining
  )}${"\n"}  ${possessionHome(teamInPossession, homeTeam)} ${nameLengthChecker(
    homeTeam
  )} ${scoreChecker(homeScoreTotal)}   ${activeGameChecker(
    playedStatus,
    startTime,
    currentQuarter,
    currentQuarterSecondsRemaining
  )}${"\n"}`;

  return scoreStr;
};

//********************************************
const currentWeek = differenceInCalendarISOWeeks(
  new Date(),
  new Date(2018, 8, 5)
);

const url = `https://api.mysportsfeeds.com/v2.0/pull/nfl/current/week/${currentWeek}/games.json`;

const query = rp.get(url, {
  auth: {
    user: apiKey,
    pass: password,
    sendImmediately: true
  }
});

const mySportsFeedsApiCall = async query => {
  try {
    const result = await rp(query);
    const storage = await JSON.parse(result.replace(/\\"/g, '"'));
    const asciiMap = await asciiMapper(storage);
    return console.log(asciiMap);
  } catch (e) {
    return console.error("*** ERROR in Node Server Async Call ***", e);
  }
};

// test rendering in server window
mySportsFeedsApiCall(query);
//********************************************

app.use(morgan("combined"));

app.get("/", (req, res) => {
  res.send(mySportsFeedsApiCall(query));
});

console.log(`Server is listening on localhost:${PORT}`);
app.listen(PORT);
