const express = require('express');
const dotenv = require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 3000;
const https = require('https');
const url = "https://api.mysportsfeeds.com/v2.0/pull/nfl"
const request = require('request');
const rp = require('request-promise');
const moment = require('moment-holiday')
const morgan = require('morgan');
const apiKey = process.env.API_KEY;
const password = process.env.PASSWORD;

let apiObj = {};

app.set("view engine", "ejs");

//********************************************

const queryUrlBuilder = url => {
  const currentNFLYear = moment().get('year')
  const dayOfWeek = moment().day()

  const seasonType = () => {
    if (moment().get('year') === 2018){
      return "regular"
    } else if (moment().get('year') === 2019){
      return "playoff"
    }
  }

  const weekNumberBuilder = () => {
    if (currentNFLYear === 2018 && dayOfWeek > 3) {
      return moment().get('week') - 35;
    } else if (currentNFLYear === 2018 && dayOfWeek <= 3) {
      return moment().get('week') - 36;
    } else if (currentNFLYear === 2019 && dayOfWeek > 3) {
      return moment().get('week') + 1
    } else if (currentNFLYear === 2019 && dayOfWeek <=3){
      return moment().get('week')
    }
  }

  let weekObj = {
    currentNFLYear: moment().get('year'),
    seasonType: seasonType(),
    currentNFLWeek: weekNumberBuilder(),
  }
  return (url + `/${weekObj.currentNFLYear}-${weekObj.seasonType}/week/${weekObj.currentNFLWeek}/games.json`)
}

//********************************************

const asciiMapper = apiObj => {
	console.log(`+---------------+`)
	console.log(`| ${awayTeam} ` + `${awayScore} ` + `${quarterNumber}qtr  |`)
	console.log(`| ${homeTeam} ` + `${homeScore} ` + `${downNumber} & ${yardsRemaining}  |`)
	console.log(`+---------------+`)
}

//********************************************

let query = rp.get(queryUrlBuilder(url), {
  "auth": {
    'user': apiKey,
    'pass': password,
    'sendImmediately': true,
  }
})

const mySportsFeedsApiCall = async (query) =>{
  try {
    apiObj = await rp(query)
		apiObj = JSON.parse(apiObj)
		console.log(apiObj.games[1])
		console.log(moment(apiObj.games[0].schedule.startTime).format("dddd"))
    return apiObj
  }
  catch (e){
    return console.error("*** ERROR ***",e)
  }
}

mySportsFeedsApiCall(query)

//********************************************

app.use(morgan('combined'))

app.get("/", (req, res) => {
	res.send();
	}
)

console.log(`Server is listening on localhost:${PORT}`);
app.listen(PORT)
