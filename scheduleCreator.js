"use strict";
let teams = [];
let structure;

function findTeamWithId(id) {
  for (const team of teams) {
    if (team.teamId === id) {
      return team;
    }
  }
  const team = new Team(id);
  teams.push(team);
  return team;
}

function extractStructure(string) {
  const extracted = [];
  for (const subleagueDef of string.split(/SL\d/g)) {
    if (subleagueDef.trim() === "") continue;
    console.log(`This is a group: ${subleagueDef}`);
    const subleague = [];
    extracted.push(subleague);
    for (const divDef of subleagueDef.matchAll(/D\d+T\d+/g)) {
      const index = divDef[0].indexOf("T");
      const numTeams = divDef[0].slice(index + 1);
      subleague.push(numTeams);
      console.log(divDef);
      console.log(`numTeams = ${divDef[0].slice(index + 1)}`);
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
      teams = [];
      const fileContent = event.target.result;
      let first = true;
      for (const line of fileContent.split("\n")) {
        if (line.startsWith("#") || line.trim() === "") continue;
        if (first) {
          structure = extractStructure(line);
          first = false;
          continue;
        }
        const items = line.split(",");
        for (let i = 0; i < items.length; i++)
          items[i] = Number(items[i].trim());
        const [homeId, awayId, games, days, repeat] = items;

        const homeTeam = findTeamWithId(homeId);
        const awayTeam = findTeamWithId(awayId);
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
      const totalGames = teams[0].homeGames + teams[0].awayGames;

      totalGamesLabel.textContent = `Games per team: ${totalGames}`;
      daysInput.value = totalGames;
    };

    reader.readAsText(file);
  });
  createScheduleButton.addEventListener("click", function () {
    const days = daysInput.value;
    for (const team of teams) {
      team.setOffDays(days);
    }
  });
};
