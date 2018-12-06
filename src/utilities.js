const format = require("date-fns/format");

const NUM_SUFFIXES = {
  1: "st",
  2: "nd",
  3: "rd",
  4: "th"
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
    if (name === "LA") return "LAR ";
    if (name.length === 2) return name + "  ";
    return name + " ";
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
