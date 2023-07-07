"use strict";

const TeamMatchup = class {
  constructor(numGames, team1, team2) {
    this.numGames = numGames;
    this.teams = [team1, team2];
  }
};

const Team = class {
  constructor(teamId) {
    this.teamId = teamId;
    this.matchups = [];
  }

  addMatchup(matchup) {
    this.matchups.push(matchup);
  }
};
