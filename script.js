"use strict";

const STRUCTURE_CLASS = "structure-container";
const SETTINGS_CLASS = "settings-container";
const DIVISION_CLASS = "division-container";
const SUBLEAGUE_CLASS = "subleague-container";
const TEAM_CLASS = "team-container";
const SCHEDULE_CLASS = "schedule-container";

const MAX_TEAMS_DIVISION = 20;
const DEFAULT_TEAMS_DIVISION = 4;

//idea: if sl2 division number is negative
const DivMatchup = class {
  constructor(numGames, div1, div2, teamsInDiv1, teamsInDiv2) {
    this.numGames = numGames;
    this.div1 = div1;
    this.div2 = div2;
    this.teamsInDiv1 = teamsInDiv1;
    this.teamsInDiv2 = teamsInDiv2;
  }
};

function init() {
  const subLeague = document.getElementById("subleagues");
  subLeague.selectedIndex = 0;

  const divs1 = document.getElementById("divisions-1");
  divs1.selectedIndex = 0;

  const divs2 = document.getElementById("divisions-2");
  divs2.selectedIndex = 0;

  const teams1 = document.getElementById("teams-1-1");
  teams1.selectedIndex = 2;

  const teams2 = document.getElementById("teams-2-1");
  teams2.selectedIndex = 2;
}

window.onload = function () {
  init();

  const subleaguesSelect = document.getElementById("subleagues");
  const subleagueContainers = [
    ...document.querySelectorAll(`.${SUBLEAGUE_CLASS}`),
  ];

  const btnStructureSubmit = document.getElementById("structure-submit");
  const scheduleContainer = document.querySelector(`.${SCHEDULE_CLASS}`);

  const mainContainer = document.querySelector(".main");
  const structureContainer = document.querySelector(`.${STRUCTURE_CLASS}`);
  const settingsContainer = document.querySelector(`.${SETTINGS_CLASS}`);

  function numChildrenWithClass(container, className) {
    let count = 0;
    for (const child of container.children) {
      if (child.classList.contains(className)) count++;
    }
    return count;
  }

  function getChildWithClass(container, className) {
    for (const child of container.children) {
      if (child.classList.contains(className)) return child;
    }
  }

  function addTeamContainer(divContainer, subleague, division) {
    const team = numChildrenWithClass(divContainer, TEAM_CLASS) + 1;

    const teamContainer = document.createElement("div");
    teamContainer.classList.add(TEAM_CLASS);
    teamContainer.setAttribute("id", `team-${subleague}-${division}-${team}`);
    teamContainer.textContent = `Team ${team}`;
    divContainer.appendChild(teamContainer);
  }

  function setTeamsInDiv(divContainer, subleague, division, numTeams) {
    const currentNumTeams = numChildrenWithClass(divContainer, TEAM_CLASS);
    if (numTeams < currentNumTeams) {
      for (let i = currentNumTeams; i > numTeams; i--) {
        const teamContainer = document.getElementById(
          `team-${subleague}-${division}-${i}`
        );
        divContainer.removeChild(teamContainer);
      }
    } else if (numTeams > currentNumTeams) {
      for (let i = currentNumTeams; i < numTeams; i++) {
        addTeamContainer(divContainer, subleague, division);
      }
    }
  }

  function addDivisionContainer(subleagueContainer) {
    const subleague = subleagueContainers.indexOf(subleagueContainer) + 1;
    const division =
      numChildrenWithClass(subleagueContainer, DIVISION_CLASS) + 1;

    const divContainer = document.createElement("div");
    divContainer.classList.add(DIVISION_CLASS);
    divContainer.setAttribute("id", `division-${subleague}-${division}`);
    subleagueContainer.appendChild(divContainer);

    const header = document.createElement("h2");
    header.textContent = `Division ${division}`;
    divContainer.appendChild(header);

    const label = document.createElement("label");
    label.setAttribute("for", "teams");
    label.textContent = "Number of Teams";
    divContainer.appendChild(label);

    const select = document.createElement("select");
    select.setAttribute("name", "teams");
    select.setAttribute("id", `teams-${subleague}-${division}`);
    for (let i = 2; i <= MAX_TEAMS_DIVISION; i++) {
      const option = document.createElement("option");
      option.setAttribute("value", i);
      option.textContent = i;
      if (i === DEFAULT_TEAMS_DIVISION) option.setAttribute("selected", "true");
      select.add(option);
    }
    divContainer.appendChild(select);

    select.addEventListener("change", function () {
      const numTeams = select.selectedIndex + 2;
      setTeamsInDiv(divContainer, subleague, division, numTeams);
    });

    setTeamsInDiv(divContainer, subleague, division, DEFAULT_TEAMS_DIVISION);
  }

  subleaguesSelect.addEventListener("change", function () {
    if (subleaguesSelect.selectedIndex === 0) {
      subleagueContainers[1].classList.add("hidden");
    } else {
      subleagueContainers[1].classList.remove("hidden");
    }
  });

  for (let i = 1; i <= 2; i++) {
    const divisionSelect = document.getElementById(`divisions-${i}`);
    const subleagueContainer = subleagueContainers[i - 1];

    divisionSelect.addEventListener("change", function () {
      const numDivisionsNew = divisionSelect.selectedIndex + 1;
      const numDivisionsOld = numChildrenWithClass(
        subleagueContainer,
        DIVISION_CLASS
      );
      if (numDivisionsNew < numDivisionsOld) {
        for (let j = numDivisionsOld; j > numDivisionsNew; j--) {
          const divContainer = document.getElementById(`division-${i}-${j}`);
          subleagueContainer.removeChild(divContainer);
        }
      } else if (numDivisionsNew > numDivisionsOld) {
        for (let j = numDivisionsOld; j < numDivisionsNew; j++) {
          addDivisionContainer(subleagueContainer);
        }
      }
    });

    const teamSelect = document.getElementById(`teams-${i}-1`);
    const divContainer = getChildWithClass(subleagueContainer, DIVISION_CLASS);
    teamSelect.addEventListener("change", function () {
      const numTeams = teamSelect.selectedIndex + 2;
      setTeamsInDiv(divContainer, i, 1, numTeams);
    });
  }

  function getSettingsData() {
    return {
      numGames: document.getElementById("games-count").value,
      numDoubleheaders: document.getElementById("doubleheader-count").value,
      interleague: document.getElementById("interleague").checked,
      extraGames: document.getElementById("extra-games").value,
    };
  }

  function getStructureData() {
    const numSubLeagues = Number(document.getElementById("subleagues").value);
    const structure = { numSubLeagues, subLeagues: [] };

    for (let i = 1; i <= numSubLeagues; i++) {
      const numDivisions = Number(
        document.getElementById(`divisions-${i}`).value
      );
      const subLeague = [];
      for (let j = 1; j <= numDivisions; j++) {
        subLeague.push(
          Number(document.getElementById(`teams-${i}-${j}`).value)
        );
      }
      structure.subLeagues.push(subLeague);
    }

    return structure;
  }

  function createDivScheduleHeader(
    multipleSubLeagues,
    subLeagueNum,
    divisionNum,
    remainingGames
  ) {
    return `${
      multipleSubLeagues ? `Sub League ${subLeagueNum} ` : ""
    } Division ${divisionNum} - Games Remaining ${remainingGames}`;
  }

  function createInputId(sl1, div1, sl2, div2) {
    return `games-sl-${sl1}-div-${div1}-vs-sl-${sl2}-div-${div2}`;
  }

  function createSpanId(sl1, div1, sl2, div2) {
    return `opp-sl-${sl1}-div-${div1}-vs-sl-${sl2}-div-${div2}`;
  }

  function breakIntoSeries(teams, numGames) {
    let n = numGames;
    const seriesArr = [];
    while (true) {
      if (n < 5) {
        seriesArr.push(new Series(n, ...teams));
        break;
      } else if (n === 8) {
        seriesArr.push(new Series(4, ...teams));
        seriesArr.push(new Series(4, ...teams));
        break;
      } else {
        const series = new Series(3, ...teams);
        n -= 3;
      }
    }
    return seriesArr;
  }

  function createSeriesFromTeamMatchup(teamMatchup) {
    let seriesSets;
    if (teamMatchup.numGames < 4) {
      const seriesHome = new Series(teamMatchup.numGames, ...teamMatchup.teams);
      const seriesAway = new Series(
        teamMatchup.numGames,
        ...teamMatchup.teams.reverse()
      );

      seriesSets = [[seriesHome], [seriesAway]];
    } else if (teamMatchup.numGames === 6 || teamMatchup.numGames === 8) {
      const seriesLength = teamMatchup.numGames / 2;
      const seriesHome = new Series(seriesLength, ...teamMatchup.teams);
      const seriesAway = new Series(
        seriesLength,
        ...teamMatchup.teams.reverse()
      );

      seriesSets = [[seriesHome, seriesAway]];
    } else if (teamMatchup.numGames % 2 === 0) {
      const halfGames = teamMatchup.numGames / 2;
      seriesSets = [
        ...breakIntoSeries(teamMatchup.teams, halfGames),
        ...breakIntoSeries(teamMatchup.teams.reverse(), halfGames),
      ];
    } else {
      const lowHalfGames = Math.floor(teamMatchup.numGames / 2);
      const highHalfGames = lowHalfGames + 1;
      seriesSets = [
        [
          ...breakIntoSeries(teamMatchup.teams, lowHalfGames),
          ...breakIntoSeries(teamMatchup.teams.toReversed(), highHalfGames),
        ],
        [
          ...breakIntoSeries(teamMatchup.teams, highHalfGames),
          ...breakIntoSeries(teamMatchup.teams.toReversed(), lowHalfGames),
        ],
      ];
    }
    return seriesSets;
  }

  //return the seriesSet with team as home team for most games
  function setAsPrimaryHomeTeam(seriesOptions, team) {
    for (let i = 0; i < seriesOptions.length; i++) {
      const option = seriesOptions[i];
      let homeGames = 0;
      let awayGames = 0;
      for (const series of option) {
        if (team === series.homeTeam) {
          homeGames += series.numGames;
        } else {
          awayGames += series.numGames;
        }
      }

      if (homeGames > awayGames) {
        return i;
      }
    }
    console.log(
      `Possible error: Could not find option with team ${team.teamId} as primary home team.`
    );
    return 0;
  }

  btnStructureSubmit.addEventListener("click", function () {
    for (const child of scheduleContainer.children) {
      if (child.localName !== "h2") {
        scheduleContainer.removeChild(child);
      }
    }

    const settings = getSettingsData();
    const structure = getStructureData();

    const headerLabels = [];
    const divMatchups = [];

    const updateHeaders = function () {
      const remaining = new Map();
      for (const matchup of divMatchups) {
        for (let i = 1; i <= 2; i++) {
          const div = matchup[`div${i}`];
          let opps = matchup[`teamsInDiv${3 - i}`];
          const sameDiv = div === matchup[`div${3 - i}`];
          if (sameDiv) opps--;

          if (!remaining.has(div)) {
            remaining.set(div, settings.numGames - matchup.numGames * opps);
          } else {
            const oldVal = remaining.get(div);
            remaining.set(div, oldVal - matchup.numGames * opps);
          }
          if (sameDiv) break;
        }
      }

      for (const headerLabel of headerLabels) {
        const matches = headerLabel.textContent.matchAll(/\d+/gm);

        let subLeague = 1;
        let showSubLeague = false;

        if (headerLabel.textContent.startsWith("Sub League")) {
          subLeague = Number(matches.next().value[0]);
          showSubLeague = true;
        }
        const division = Number(matches.next().value[0]);
        const games = remaining.get(division * (subLeague === 1 ? 1 : -1));

        headerLabel.textContent = `${
          showSubLeague ? `Sub League ${subLeague} ` : ""
        } Division ${division} - Games Remaining ${games}`;
      }
    };

    const addMatchup = function (
      sl1,
      div1,
      sl2,
      div2,
      divScheduleContainer,
      teamsInDiv,
      teamsInOppDiv
    ) {
      const sl1Factor = sl1 === 1 ? 1 : -1;
      const sl2Factor = sl2 === 1 ? 1 : -1;
      const sameTeam = sl1 === sl2 && div1 === div2;

      const matchup = new DivMatchup(
        0,
        div1 * sl1Factor,
        div2 * sl2Factor,
        teamsInDiv,
        teamsInOppDiv
      );
      divMatchups.push(matchup);

      const matchupContainer = document.createElement("div");
      matchupContainer.classList.add("division-matchup");
      divScheduleContainer.appendChild(matchupContainer);

      const inputId = createInputId(sl1, div1, sl2, div2);

      const matchupLabel = document.createElement("label");
      matchupLabel.setAttribute("for", inputId);
      matchupLabel.textContent = sameTeam
        ? "Games vs Own Division"
        : `Games vs Sub League ${sl2} Division ${div2}`;
      matchupContainer.appendChild(matchupLabel);

      const matchupInput = document.createElement("input");
      matchupInput.setAttribute("type", "number");
      matchupInput.setAttribute("id", inputId);
      matchupInput.setAttribute("name", inputId);
      matchupInput.setAttribute("value", "0");
      matchupContainer.appendChild(matchupInput);

      const matchupSpan = document.createElement("span");
      matchupSpan.setAttribute("id", createSpanId(sl1, div1, sl2, div2));
      matchupSpan.textContent = "per opponent";
      matchupContainer.appendChild(matchupSpan);

      matchupInput.addEventListener("change", function () {
        const newTotal = Number(matchupInput.value);
        matchup.numGames = newTotal;

        updateHeaders();
      });
    };

    mainContainer.removeChild(settingsContainer);
    mainContainer.removeChild(structureContainer);
    scheduleContainer.classList.remove("hidden");

    for (let i = 0; i < structure.numSubLeagues; i++) {
      const subLeague = structure.subLeagues[i];
      for (let j = 0; j < subLeague.length; j++) {
        const divScheduleContainer = document.createElement("div");
        divScheduleContainer.classList.add("div-schedule-container");
        scheduleContainer.appendChild(divScheduleContainer);

        const divScheduleHeader = document.createElement("h2");
        divScheduleHeader.textContent = createDivScheduleHeader(
          structure.numSubLeagues > 1,
          i + 1,
          j + 1,
          settings.numGames
        );
        divScheduleContainer.appendChild(divScheduleHeader);
        headerLabels.push(divScheduleHeader);

        for (let k = j; k < subLeague.length; k++) {
          addMatchup(
            i + 1,
            j + 1,
            i + 1,
            k + 1,
            divScheduleContainer,
            subLeague[j],
            subLeague[k]
          );
        }
        if (i === 0 && structure.numSubLeagues === 2 && settings.interleague) {
          for (let k = 0; k < structure.subLeagues[1].length; k++) {
            addMatchup(
              1,
              j + 1,
              2,
              k + 1,
              divScheduleContainer,
              structure.subLeagues[0][j],
              structure.subLeagues[1][k]
            );
          }
        }
      }
    }

    const btnStructureSubmit = document.createElement("button");
    btnStructureSubmit.textContent = "Create Series Files";
    scheduleContainer.appendChild(btnStructureSubmit);
    btnStructureSubmit.addEventListener("click", function () {
      const teams = [];
      const teamToDiv = new Map();

      for (let i = 0; i < structure.numSubLeagues; i++) {
        const subLeague = structure.subLeagues[i];
        for (let j = 0; j < subLeague.length; j++) {
          for (let k = 0; k < subLeague[j]; k++) {
            const team = new Team(teams.length + 1);
            teams.push(team);

            const divNum = (j + 1) * (i === 0 ? 1 : -1);
            const mapEntry = teamToDiv.get(divNum);
            if (mapEntry) {
              mapEntry.push(teams.length);
            } else {
              teamToDiv.set(divNum, [teams.length]);
            }
          }
        }
      }

      for (const divMatchup of divMatchups) {
        if (divMatchup.numGames === 0) continue;
        if (divMatchup.div1 === divMatchup.div2) {
          const teamsInDiv = teamToDiv.get(divMatchup.div1);
          //teamInDiv is array of teamId. teamId = index in teams array + 1
          for (let i = 0; i < teamsInDiv.length - 1; i++) {
            const teamId1 = teamsInDiv[i];
            for (let j = i + 1; j < teamsInDiv.length; j++) {
              const teamId2 = teamsInDiv[j];
              const teamMatchup = new TeamMatchup(
                divMatchup.numGames,
                teams[teamId1 - 1],
                teams[teamId2 - 1]
              );
              const matchupSeries = createSeriesFromTeamMatchup(teamMatchup);
              teams[teamId1 - 1].addSeriesSet(matchupSeries);
              teams[teamId2 - 1].addSeriesSet(matchupSeries);
            }
          }
        } else {
          const teamsInDiv1 = teamToDiv.get(divMatchup.div1);
          const teamsInDiv2 = teamToDiv.get(divMatchup.div2);
          for (const teamId1 of teamsInDiv1) {
            for (const teamId2 of teamsInDiv2) {
              const teamMatchup = new TeamMatchup(
                divMatchup.numGames,
                teams[teamId1 - 1],
                teams[teamId2 - 1]
              );
              const matchupSeries = createSeriesFromTeamMatchup(teamMatchup);
              teams[teamId1 - 1].addSeriesSet(matchupSeries);
              teams[teamId2 - 1].addSeriesSet(matchupSeries);
            }
          }
        }
      }
      console.log(teams);
      let requiresSecond = false;
      const diffMap = new Map();
      for (const team of teams) {
        diffMap.set(team, 0);
        if (team.seriesSets.length > 0) requiresSecond = true;
      }
      if (requiresSecond) {
        teams.forEach((team) => team.copySeriesList());
        for (const team of teams) {
          for (const set of team.seriesSets) {
            const opp =
              team === set[0][0].homeTeam
                ? set[0][0].awayTeam
                : set[0][0].homeTeam;
            const homeTeam = diffMap.get(team) > diffMap.get(opp) ? opp : team;
            const prefSchedIndex = setAsPrimaryHomeTeam(set, homeTeam);
            team.selectForPrimarySchedule(set, prefSchedIndex);
            opp.selectForPrimarySchedule(set, prefSchedIndex);
            diffMap.set(team, team.getDiff());
            diffMap.set(opp, opp.getDiff());
          }
          console.log(`Diff after scheduling: ${team.getDiff()}`);
        }
      }
    });
  });
};
