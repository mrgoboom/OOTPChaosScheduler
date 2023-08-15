"use strict";

const League = class {
  constructor(structure, numTeams) {
    this.structure = structure;
    this.teams = [];
  }

  findTeamWithId(id) {
    for (const team of this.teams) {
      if (team.teamId === id) {
        return team;
      }
    }
    const team = new Team(this, id);
    this.teams.push(team);
    return team;
  }

  teamsInSameDiv(teamId1, teamId2) {
    let counter = 0;
    for (const subLeague of this.structure) {
      for (const div of subLeague) {
        if (teamId1 <= counter + div) {
          return teamId2 > counter && teamId2 <= counter + div;
        } else {
          counter += div;
        }
      }
    }
    return false;
  }

  teamsInSameLeague(teamId1, teamId2) {
    if (this.structure.length === 1) return true;

    let beginning = 0;
    let end = 0;
    for (const subLeague of this.structure) {
      for (const div of subLeague) {
        end += div;
      }
      if (teamId1 <= end) {
        return teamId2 > beginning && teamId2 <= end;
      } else {
        beginning = end;
      }
    }
    return false;
  }
};

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

  getOpponent(team) {
    if (team === this.homeTeam) return this.awayTeam;
    else if (team === this.awayTeam) return this.homeTeam;
    else return null;
  }

  hasDoubleHeader() {
    return this.numDays !== this.numGames;
  }
};

const Team = class {
  constructor(league, teamId) {
    this.league = league;
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
    console.log(`${this.offDays} off days`);
  }

  initSchedule() {
    this.daysScheduled = 0;
    this.scheduledSeries = [];
    this.toSchedule = [...this.seriesList];
    this.candidates = [];
    this.offDaysLeft = this.offDays;
    this.scoreMap = new Map();
    this.scheduledOffDays = []; //Each offday is represent by a number that represents the index in scheduledSeries after which an off day will be scheduled
  }

  //0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4 = Friday, 5 = Saturday, 6 = Sunday
  scoreLength(dayOfWeek, seriesLength) {
    switch (dayOfWeek) {
      case 0:
        if (seriesLength === 2) return 5;
        else return 7;

      case 1:
        if (seriesLength === 2 || seriesLength === 3) return 7;
        else return 3;
      case 2:
        if (seriesLength === 2) return 7;
        else return 3;
      case 3:
        if (seriesLength === 4) return 7;
        else if (seriesLength === 2) return 5;
        else return 3;
      case 4:
        if (seriesLength === 3) return 7;
        else return 3;
      case 5:
        if (seriesLength === 2) return 7;
        else return 3;
      default:
        if (seriesLength === 2) return 7;
        else return 5;
    }
  }

  scoreRecentOpponent(opponent) {
    const prevOpponent2 = this.scheduledSeries.at(-2)?.getOpponent(this);
    if (prevOpponent2 === undefined) return 0;
    else if (opponent === prevOpponent2) return -2;

    const prevOpponent3 = this.scheduledSeries.at(-3)?.getOpponent(this);
    if (opponent === prevOpponent3) return -1;
    else return 0;
  }

  scoreDoubleHeader(hasDH) {
    if (!hasDH) return 5;
    let daysBack = 0;
    for (let i = this.scheduledSeries.length - 1; i >= 0; i++) {
      const series = this.scheduledSeries[i];
      if (series.hasDoubleHeader() || daysBack >= 14) break;
      daysBack += series.numDays;
    }
    if (daysBack > 14) return 6;
    else if (daysBack > 4) return 4;
    else return 0;
  }

  scoreIntraDivision(opponent, day) {
    if (this.league.teamsInSameDiv(this, opponent) && day < 30) return 1;
    else return 0;
  }

  scoreRepeatOpponent(opponent) {
    const prevOpponent = this.scheduledSeries.at(-1)?.getOpponent(this);
    if (opponent === prevOpponent) {
      if (this.league.teamsInSameLeague(this, opponent)) return 0;
      else return 1;
    } else {
      return 10;
    }
  }

  //0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4 = Friday, 5 = Saturday, 6 = Sunday
  scoreRemainingSeries(day, dayOfWeek) {
    for (const series of this.toSchedule) {
      const opponent = series.getOpponent(this);
      let score = this.scoreLength(dayOfWeek, series.numDays);
      score += this.scoreRecentOpponent(opponent);
      score += this.scoreDoubleHeader(series.hasDoubleHeader());
      score += this.scoreIntraDivision(opponent, day);
      score *= this.scoreRepeatOpponent(opponent);

      this.scoreMap.set(series, score);
    }
  }

  sortSeries() {
    for (let i = 0; i < this.toSchedule.length; i++) {
      const item = this.toSchedule.at(i);
      const itemScore = this.scoreMap.get(item);
      for (let j = 0; j < i; j++) {
        const compareScore = this.scoreMap.get(this.toSchedule.at(j));
        if (itemScore > compareScore) {
          this.toSchedule.splice(i, 1);
          this.toSchedule.splice(j, 0, item);
          break;
        } else if (itemScore === compareScore) {
          let spaces = 2;
          for (let k = j + 1; k < i; k++) {
            if (itemScore === this.scoreMap.get(this.toSchedule.at(k)))
              spaces++;
            else break;
          }
          const place = Math.floor(Math.random() * spaces + j);
          this.toSchedule.splice(i, 1);
          this.toSchedule.splice(place, 0, item);
          break;
        }
      }
    }
  }

  filterCandidates(opponents) {
    this.candidates = [];
    for (const series of this.toSchedule) {
      if (opponents.find((e) => e === series.getOpponent(this))) {
        this.candidates.push(series);
      }
    }
  }

  //0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4 = Friday, 5 = Saturday, 6 = Sunday
  scoreRest(dayOfWeek, remainingFactor) {
    const lastRestIndex = this.scheduledOffDays[-1] ?? 0;

    let numGames = 0;
    for (let i = this.scheduledSeries.length - 1; i > lastRestIndex; i--) {
      numGames += this.scheduledSeries[i].numGames;
    }

    if (this.offDaysLeft <= 0 || this.numGames === 0) {
      this.scoreMap.set("Rest", Number.MIN_SAFE_INTEGER);
      return Number.MIN_SAFE_INTEGER;
    }

    const offDayFactor =
      this.offDaysLeft / ((this.offDays * (this.offDays + 1)) / this.offDays);

    const restScore =
      dayOfWeek === 0 || dayOfWeek === 3
        ? (100 * offDayFactor) / remainingFactor + numGames
        : (10 * offDayFactor) / remainingFactor;

    this.scoreMap.set("Rest", restScore);

    return restScore;
  }

  getBest() {
    const bestSeriesScore = this.scoreMap.get(this.candidates[0]);
    const restScore = this.scoreMap.get("Rest");
    const bestScore = bestSeriesScore > restScore ? bestSeriesScore : restScore;
    const bestSeries =
      bestSeriesScore > restScore ? this.candidates[0] : "Rest";
    return { series: bestSeries, score: bestScore, team: this };
  }

  scheduleOffDay() {
    this.scheduledOffDays.push(this.scheduledSeries.length - 1);
    this.offDaysLeft--;
    this.daysScheduled++;
  }

  scheduleSeries(series) {
    this.scheduledSeries.push(series);
    this.scoreMap.delete(series);
    this.daysScheduled += series.numDays;

    const cIndex = this.candidates.findIndex((e) => e === series);
    this.candidates.splice(cIndex, 1);

    const tIndex = this.toSchedule.findIndex((e) => e === series);
    this.toSchedule.splice(tIndex, 1);
  }
};
