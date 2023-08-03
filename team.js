"use strict";

const TeamMatchup = class {
  constructor(numGames, team1, team2) {
    this.numGames = numGames;
    this.teams = [team1, team2];
  }
};

const Series = class {
  constructor(numGames, homeTeam, awayTeam, numDays = numGames) {
    this.numGames = numGames;
    this.numDays = numDays;
    this.homeTeam = homeTeam;
    this.awayTeam = awayTeam;
  }
};

const Team = class {
  constructor(teamId) {
    this.teamId = teamId;
    this.seriesList = [];
    this.seriesSets = [];
    this.homeGames = 0;
    this.awayGames = 0;
    this.offDays = 0;
  }

  addSeries(series) {
    this.seriesList.push(series);
    if (this === series.homeTeam) {
      this.homeGames += series.numGames;
    } else {
      this.awayGames += series.numGames;
    }
  }

  addSeriesSet(seriesSet) {
    if (!Array.isArray(seriesSet[0])) {
      for (const series of seriesSet) {
        this.seriesList.push(series);
        if (this === series.homeTeam) {
          this.homeGames += series.numGames;
        } else {
          this.awayGames += series.numGames;
        }
      }
    } else {
      this.seriesSets.push(seriesSet);
    }
  }

  getDiff() {
    return this.homeGames - this.awayGames;
  }

  copySeriesList() {
    this.seriesListB = [...this.seriesList];
  }

  //only called after copySeriesList
  selectForPrimarySchedule(seriesOptions, index) {
    for (const series of seriesOptions[index]) {
      this.seriesList.push(series);
      if (this === series.homeTeam) {
        this.homeGames += series.numGames;
      } else {
        this.awayGames += series.numGames;
      }
    }
    for (const series of seriesOptions[1 - index]) {
      this.seriesListB.push(series);
      if (this === series.homeTeam) {
        this.homeGames += series.numGames;
      } else {
        this.awayGames += series.numGames;
      }
    }
    const setIndex = this.seriesSets.indexOf(seriesOptions);
    this.seriesSets.splice(setIndex, 1);
  }

  setOffDays(days) {
    let gameDays = 0;
    for (const series of this.seriesList) {
      gameDays += series.numDays;
    }
    this.offDays = days - gameDays;
    console.log(this.offDays);
  }
};
