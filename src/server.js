const express = require("express");
const dotenv = require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

const https = require("https");
const fetch = require("node-fetch");
const base64 = require("base-64");
const morgan = require("morgan");
const Table = require("cli-table");
const chalk = require("chalk");
const apiKey = process.env.API_KEY;
const password = process.env.PASSWORD;
const differenceInDays = require("date-fns/difference_in_days");
const format = require('date-fns/format');
const util = require("./utilities.js");

//********************************************

const activeGameChecker = (
  gameStatus,
  startTime,
  currentQuarter,
  currentQuarterSecondsRemaining
) => {
  if (gameStatus === "UNPLAYED") return util.gameDateMaker(startTime);
  if (gameStatus === "LIVE")
    return (
      currentQuarter +
      "Q" +
      "  " +
      util.timeConverter(currentQuarterSecondsRemaining)
    );
  return "Final";
};

const downAndYardsMaker = (currentDown, yardsRemaining) => {
  if (currentDown !== null)
    return `${util.downOrdinalMaker(currentDown, yardsRemaining)}`;
  return "";
}

const scoreStringMaker = json => {
  const { games, teamsWithByes } = json;
  const scoreTable = new Table({
    head: ["  Away", "  Home", "Status"],
    colWidths: [13, 13, 30]
  });

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

    let tableRow = [];
    tableRow.push(
      `${util.possessionAway(
        teamInPossession,
        awayTeam
      )} ${util.nameLengthChecker(awayTeam)} ${util.scoreChecker(
        awayScoreTotal
      )}`
    );
    tableRow.push(
      `${util.possessionHome(
        teamInPossession,
        homeTeam
      )} ${util.nameLengthChecker(homeTeam)} ${util.scoreChecker(
        homeScoreTotal
      )}`
    );
    tableRow.push(
      `${activeGameChecker(
        playedStatus,
        startTime,
        currentQuarter,
        currentQuarterSecondsRemaining
      )} ${downAndYardsMaker(currentDown, currentYardsRemaining)}`
    );

    scoreTable.push(tableRow);
  }

  return (
    `\n  NFL Week ${currentNFLWeek}\n\n` +
    scoreTable.toString() +
    `${util.teamsWithByesPrinter(teamsWithByes)} \n`
  );
};

const scoreHTMLMaker = json => {
  const { games, teamsWithByes } = json;
  let tempStr = ""

  for(i in games) {
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

    tempStr = tempStr +
    `<tr>
      <td width="100">${(awayTeam)} ${util.scoreChecker(awayScoreTotal)}</td>
      <td width="100">${(homeTeam)} ${util.scoreChecker(homeScoreTotal)}</td>
      <td>${activeGameChecker(
      playedStatus,
      startTime,
      currentQuarter,
      currentQuarterSecondsRemaining
    )} ${downAndYardsMaker(currentDown, currentYardsRemaining)}</td></tr>`


  }

  let htmlStr = `
  <!DOCTYPEhtml>
  <html>
    <head>
      <style>
        html {
          font-family: Courier;
          background-color: honeydew;
        }
      </style>
      <h1>NFL Week ${currentNFLWeek}</h1>
    </head>
    <body>
      <table width="600">
        <tr align="left">
          <th>Away</th>
          <th>Home</th>
          <th>Status</th>
        </tr>
      ${tempStr}
      </table>
    </body>
  </html>
  `

  return htmlStr
}
//********************************************

const nbaScoreStringMaker = json => {
  const { games } = json

  const scoreTable = new Table({
    head: [" Away", " Head", " Status"],
    colWidths: [13, 13, 30]
  })

  

  for (i in games){
    const {
      isGameActivated,
      clock,
      endTimeUTC,
      vTeam: {
        triCode: awayTeam,
        score: awayScore
      },
      hTeam: {
        triCode: homeTeam,
        score: homeScore
      },
      startTimeEastern: startTime,
      period: {
        current: currentQuarter,
        maxRegular,
        isEndOfPeriod
      }
    } = games[i]

    const isActive = (
      isGameActivated,
      startTime,
      clock,
      currentQuarter,
      maxRegular,
      isEndOfPeriod,
      endTimeUTC) => {

        if (isGameActivated) {
          return `${clock}  ${currentQuarter}Q`
         
        } else {
          if (endTimeUTC) {
            return `Final`
          } else {
            return `${startTime}`
          }
        }
      }

    let tableRow = []
    tableRow.push(
      ` ${awayTeam} ${awayScore}`
    );
    tableRow.push(
      ` ${homeTeam} ${homeScore}`
    );
    tableRow.push(
      ` ${isActive(isGameActivated, startTime, clock, currentQuarter, maxRegular, isEndOfPeriod, endTimeUTC)}`
    )
    scoreTable.push(tableRow)
  }
  return scoreTable.toString()
}


//********************************************
const currentNFLWeek = Math.round(
  (differenceInDays(new Date(), new Date(2018, 8, 2)) + 0.5) / 7
);

const urlNFL = `https://api.mysportsfeeds.com/v2.0/pull/nfl/current/week/${currentNFLWeek}/games.json`;
const encoded = base64.encode(`${apiKey}:${password}`);
const auth = { headers: { Authorization: `Basic ${encoded}` } };

const currentNBADay = format(new Date(), 'YYYYMMDD')
const urlNBA = `http://data.nba.net/10s/prod/v1/${currentNBADay}/scoreboard.json`

//********************************************

app.use(morgan("combined"));

app.get("/", (req, res) => {
  const userAgent = req.headers['user-agent'].toLowerCase().replace(/[^a-z]/g, "")
    fetch(urlNFL, auth)
      .then(body => {
        return body.json();
      })
      .then(json => {
        if (userAgent === "curl"){
          const scoreString = scoreStringMaker(json);
          res.send(scoreString);
        } else {
          const scoreString = scoreHTMLMaker(json)
          res.send(scoreString);
        }

      })
      .catch(error => console.error("*** NFL Fetch Error ***", error));
});

app.get("/nba", (req, res) => {
  const userAgent = req.headers['user-agent'].toLowerCase().replace(/[^a-z]/g, "")
  fetch(urlNBA)
    .then(res => {
      return res.json()
    })
    .then(json => {
      if (userAgent === 'curl'){
        const scoreString = nbaScoreStringMaker(json)
        res.send(scoreString)
      } else {
        res.send("NBA")
      }
    })
    .catch(error => console.error("*** NBA Fetch Error ***", error))

})

console.log(
  `Server is listening on localhost:${PORT}$\nStarted at ${new Date()}`
);
app.listen(PORT);
