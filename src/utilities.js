const format = require("date-fns/format");
const chalk = require("chalk");

const NUM_SUFFIXES = {
  1: "st",
  2: "nd",
  3: "rd",
  4: "th"
};

const teamColors = {
  JAX: "#006778",
  TEN: "#4495D1",
  NYJ: "#046A38",
  BUF: "#004FDA",
  NYG: "#1339aa",
  WAS: "#ad475f",
  NO: "#D3BC8D",
  TB: "#FF7900",
  NE: "#04328C",
  MIA: "#008E97",
  LAR: "#006ede",
  CHI: "#C83803",
  IND: "#A2AAAD",
  HOU: "#A71930",
  CAR: "#0085CA",
  CLE: "#FF3C00",
  BAL: "#5d49da",
  KC: "#E31837",
  ATL: "#A71930",
  GB: "#589787",
  DEN: "#FB4F14",
  SF: "#AA0000",
  CIN: "#FB4F14",
  LAC: "#0080C6",
  DET: "#0076B6",
  ARI: "#97233F",
  PHI: "#046A38",
  DAL: "#003594",
  PIT: "#FFB612",
  OAK: "#A5ACAF",
  MIN: "#FFC62F",
  SEA: "#69BE28"
};

module.exports = {
  scoreChecker: score => {
    if (score === null) return " 0";
    if (score.toString().length === 1) return " " + score;
    return score;
  },
  downOrdinalMaker: (currentDown, yardsRemaining) => {
    if (currentDown === 0) return "intermission";
    if (!currentDown) return "";
    return `${NUM_SUFFIXES[currentDown]} & ${yardsRemaining}`;
  },
  downAndYardsMaker: (currentDown, yardsRemaining) => {
    if (currentDown !== null)
      return `${this.downOrdinalMaker(currentDown, yardsRemaining)}`;
    return "";
  },
  nameLengthChecker: name => {
    if (name === "LA") return chalk.hex(`${teamColors[name]}`).bold(`${name}R`);
    if (name.length === 2) return chalk.hex(`${teamColors[name]}`).bold(`${name}`) + "  ";
    return chalk.hex(`${teamColors[name]}`).bold(`${name}`) + " ";
  },
  timeConverter: currentQuarterSecondsRemaining => {
    const minutes = currentQuarterSecondsRemaining / 60;
    let seconds = currentQuarterSecondsRemaining % 60;
    seconds < 10 ? (seconds = `0${seconds}`) : seconds;
    return `${Math.trunc(minutes)}:${seconds}`;
  },
  teamsWithByesPrinter: teamsWithByes => {
    if (teamsWithByes.length !== 0)
      return `\nteams on bye: ${teamsWithByes
        .map(x => x.abbreviation)
        .toString()}`;
    return `\n teams on bye: none\n`;
  },
  gameDateMaker: date => {
    return format(date, "ddd ha");
  },
  possessionAway: (possession, awayTeam) => {
    const teamPoss = possession && possession.abbreviation;
    return teamPoss === awayTeam ? String.fromCharCode(62) : " ";
  },
  possessionHome: (possession, homeTeam) => {
    const teamPoss = possession && possession.abbreviation;
    return teamPoss === homeTeam ? String.fromCharCode(60) : " ";
  }
};
