const format = require("date-fns/format");

module.exports = {
  scoreChecker: score => {
    return score === null
      ? " 0"
      : score.toString().length === 1
      ? " " + score
      : score;
  },
  downOrdinalMaker: (currentDown, yardsRemaining) => {
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
  },
  downAndYardsMaker: (currentDown, yardsRemaining) => {
    return currentDown !== null
      ? `${this.downOrdinalMaker(currentDown, yardsRemaining)}`
      : "";
  },
  nameLengthChecker: name => {
    if (name === "LA") {
      return "LAR ";
    }
    return name.length === 2 ? name + "  " : name + " ";
  },
  timeConverter: currentQuarterSecondsRemaining => {
    const minutes = currentQuarterSecondsRemaining / 60;
    let seconds = currentQuarterSecondsRemaining % 60;
    seconds < 10 ? (seconds = `0${seconds}`) : seconds;
    return `${Math.trunc(minutes)}:${seconds}`;
  },
  teamsWithByesPrinter: teamsWithByes => {
    return teamsWithByes.length !== 0
      ? `${"\n"}teams on bye: ${teamsWithByes
          .map(x => x.abbreviation)
          .toString()}`
      : `${"\n"}no teams on bye`;
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
