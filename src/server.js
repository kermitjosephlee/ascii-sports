const express = require('express');
const dotenv = require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
const https = require('https');
const url = "https://api.mysportsfeeds.com/v2.0/pull/nfl"
const request = require('request');
const rp = require('request-promise');
const moment = require('moment')
const morgan = require('morgan');
const apiKey = process.env.API_KEY;
const password = process.env.PASSWORD;

app.set("view engine", "ejs");

//********************************************

const queryUrlBuilder = url => {
  const currentNFLYear = moment().get('year')
  const dayOfWeek = moment().day()

  const seasonType = () => {
    return (moment().get('year') === 2018) ? "regular"
      : ("playoff")
  }

  const weekNumberBuilder = () => {
    return (currentNFLYear === 2018 && dayOfWeek > 3) ? (moment().get('week') - 35)
      : (currentNFLYear === 2018 && dayOfWeek <= 3) ? (moment().get('week') - 36)
      : (currentNFLYear === 2019 && dayOfWeek > 3) ? (moment().get('week') + 1)
      : (moment().get('week') + 1);
  }

  let weekObj = {
    currentNFLYear: moment().get('year'),
    seasonType: seasonType(),
    currentNFLWeek: weekNumberBuilder(),
  }
  return (url + `/${weekObj.currentNFLYear}-${weekObj.seasonType}/week/${weekObj.currentNFLWeek}/games.json`)
}

//********************************************

const asciiMapper = ({ games, teamsWithByes }) => {
  games.forEach(gameHandler)
  console.log(`+-------------------+`)
  console.log("On Byes: ", teamsWithByesPrinter(teamsWithByes))
};

const nameLengthChecker = name => {
  if (name === "LA") {
   return "LAR  "
 }
  return (name.length === 2 ? name + "   " : name + "  ")
}

const scoreChecker = score => {
  return (score === null ? " 0" : score)
}

const activeGameChecker = (gameStatus, gameTime) => {
  return (gameStatus === "UNPLAYED") ? (gameDateMaker(gameTime))
    : "F"
}

const gameDateMaker = date => {
  return moment(date).format('ddd ha').toLowerCase()
}

const downAndYardsMaker = (currentDown, yardsRemaining) => {
  return (currentDown !== null ? `${currentDown} & ${yardsRemaining}` : "")
}

const teamsWithByesPrinter = teamsWithByes => {
  return teamsWithByes.map(x => x.abbreviation).toString()
}

const possessionAway = (possession, awayTeam) => {
  return (possession === awayTeam ? String.fromCharCode(187) : " ")
}

const possessionHome = (possession, homeTeam) => {
  return (possession === homeTeam ? String.fromCharCode(187) : " ")
}

const gameHandler = game => {
  const awayTeam = game.schedule.awayTeam.abbreviation;
  const homeTeam = game.schedule.homeTeam.abbreviation;
  const awayScore = game.score.awayScoreTotal;
  const homeScore = game.score.homeScoreTotal;
  const gameStatus = game.schedule.playedStatus;
  const gameTime = game.schedule.startTime;
  const currentDown = game.score.currentDown;
  const yardsRemaining = game.score.currentYardsRemaining;
  const scrimmage = game.score.lineOfScrimmage;
  const possession = game.score.teamInPossession;

  console.log(`+-------------------+`)
  console.log(" " + possessionAway(possession, awayTeam) + " " + (nameLengthChecker(awayTeam)) + scoreChecker(awayScore) + "   " + activeGameChecker(gameStatus, gameTime))
  console.log(" " + possessionHome(possession, homeTeam) + " " + (nameLengthChecker(homeTeam)) + scoreChecker(homeScore) + "   " + downAndYardsMaker(currentDown, yardsRemaining))
}

let query = rp.get(queryUrlBuilder(url), {
  "auth": {
    'user': apiKey,
    'pass': password,
    'sendImmediately': true,
  }
})

const mySportsFeedsApiCall = async (query) =>{
  try {
    let result = await rp(query)
    asciiMapper(JSON.parse(result));
  }
  catch (e){
    return console.error("*** ERROR ***",e)
  }
}

mySportsFeedsApiCall(query)

//********************************************

app.use(morgan('combined'))

app.get("/", (req, res) => {
	res.send(mySportsFeedsApiCall(query));
	}
)

console.log(`Server is listening on localhost:${PORT}`);
app.listen(PORT)
