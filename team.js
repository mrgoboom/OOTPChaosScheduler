"use strict";

const TeamMatchup = class {
  constructor(numGames, team1, team2) {
    this.numGames = numGames;
    this.teams = [team1, team2];
  }
};

const Series = class {
  constructor(numGames, homeTeam, awayTeam) {
    this.numGames = numGames;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
    this.homeGames = 0;
    this.awayGames = 0;
  }
};

const Team = class {
  constructor(teamId) {
    this.teamId = teamId;
    this.seriesList = [];
  }

  addSeries(series) {
    this.seriesList.push(series);
    if (this.teamId === series.homeTeam) this.homeGames += series.numGames;
    else this.awayGames += series.numGames;
  }
};
