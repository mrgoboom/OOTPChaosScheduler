"use strict";
let league;

function extractStructure(string) {
  const extracted = [];
  for (const subleagueDef of string.split(/SL\d/g)) {
    if (subleagueDef.trim() === "") continue;
    const subleague = [];
    extracted.push(subleague);
    for (const divDef of subleagueDef.matchAll(/D\d+T\d+/g)) {
      const index = divDef[0].indexOf("T");
      const numTeams = divDef[0].slice(index + 1);
      subleague.push(numTeams);
    }
  }
  return extracted;
}

window.onload = function () {
  const fileInput = document.getElementById("series-file");
  const totalGamesLabel = document.getElementById("games-label");
  const daysInput = document.getElementById("days");
  const createScheduleButton = document.getElementById("create-schedule");

  fileInput.addEventListener("change", function () {
    if (!fileInput.files || fileInput.files.length === 0) return;

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function (event) {
      const fileContent = event.target.result;
      let first = true;
      for (const line of fileContent.split("\n")) {
        if (line.startsWith("#") || line.trim() === "") continue;
        if (first) {
          const structure = extractStructure(line);
          league = new League(structure);
          first = false;
          continue;
        }
        const items = line.split(",");
        for (let i = 0; i < items.length; i++)
          items[i] = Number(items[i].trim());
        const [homeId, awayId, games, days, repeat] = items;

        const homeTeam = league.findTeamWithId(homeId);
        const awayTeam = league.findTeamWithId(awayId);
        if (repeat) {
          for (let i = 0; i < repeat; i++) {
            const series = new Series(games, homeTeam, awayTeam, days);
            homeTeam.addSeries(series);
            awayTeam.addSeries(series);
          }
        } else {
          const series = new Series(games, homeTeam, awayTeam, days);
          homeTeam.addSeries(series);
          awayTeam.addSeries(series);
        }
      }
      const totalGames = league.teams[0].homeGames + league.teams[0].awayGames;

      totalGamesLabel.textContent = `Games per team: ${totalGames}`;
      daysInput.value = totalGames;
    };

    reader.readAsText(file);
  });

  function getTeamsReadyForSeries(day) {
    const ready = [];
    for (const team of league.teams) {
      if (team.daysScheduled === day) {
        ready.push(team);
      }
    }
    return ready;
  }

  function nextDay(day) {
    if (day === 6) {
      return 0;
    } else {
      return day + 1;
    }
  }

  createScheduleButton.addEventListener("click", function () {
    const days = daysInput.value;
    //0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4 = Friday, 5 = Saturday, 6 = Sunday
    let dayOfWeek = 4;
    const allSeries = new Set();

    for (const team of league.teams) {
      team.setOffDays(days);
      for (const series of team.seriesList) {
        allSeries.add(series);
      }
      team.initSchedule();
    }

    for (let day = 0; day < days; day++) {
      const needsScheduling = getTeamsReadyForSeries(day);
      const remainingFactor = (days - day) / days;
      for (const team of needsScheduling) {
        team.scoreRemainingSeries(dayOfWeek, day);
        team.sortSeries();
        team.scoreRest(dayOfWeek, remainingFactor);
      }
      while (needsScheduling.length > 0) {
        let lowestHighest = Number.MAX_SAFE_INTEGER;
        let toSchedule;
        for (const team of needsScheduling) {
          team.filterCandidates(needsScheduling);
          const best = team.getBest();
          if (best.score < lowestHighest) {
            lowestHighest = best.score;
            toSchedule = best;
          }
        }

        if (toSchedule.series === "Rest") {
          toSchedule.team.scheduleOffDay();
          const index = needsScheduling.findIndex((e) => e === toSchedule.team);
          needsScheduling.splice(index, 1);
        } else {
          const opponent = toSchedule.series.getOpponent(toSchedule.team);
          toSchedule.team.scheduleSeries(toSchedule.series);
          opponent.scheduleSeries(toSchedule.series);
          allSeries.delete(toSchedule.series);

          const index = needsScheduling.findIndex((e) => e === toSchedule.team);
          needsScheduling.splice(index, 1);

          const oppIndex = needsScheduling.findIndex((e) => e === opponent);
          needsScheduling.splice(oppIndex, 1);
        }
      }
      dayOfWeek = nextDay(dayOfWeek);
    }
    console.log(league);
  });
};
