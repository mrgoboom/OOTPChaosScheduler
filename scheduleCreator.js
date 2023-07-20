"use strict";
let teams = [];

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

      for (const line of fileContent.split("\n")) {
        if (line.startsWith("#") || line.trim() === "") continue;
        const items = line.split(",");
        for (let i = 0; i < items.length; i++)
          items[i] = Number(items[i].trim());
        const [homeId, awayId, games, days, repeat] = items;

        console.log(
          `Home: ${homeId}, Away: ${awayId}, Games: ${games}, Days: ${days}, Repeat: ${repeat}`
        );
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
      console.log(totalGames);
      totalGamesLabel.textContent = `Games per team: ${totalGames}`;
      daysInput.value = totalGames;
    };

    reader.readAsText(file);
  });
};
