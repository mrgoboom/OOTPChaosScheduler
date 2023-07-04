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
const Matchup = class {
  constructor(numGames, div1, div2) {
    this.numGames = numGames;
    this.divs = new Set([div1, div2]);
  }
};

window.onload = function () {
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
      interleague: document.getElementById("interleague").value,
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

  btnStructureSubmit.addEventListener("click", function () {
    for (const child of scheduleContainer.children) {
      if (child.localName !== "h2") {
        scheduleContainer.removeChild(child);
      }
    }

    const settings = getSettingsData();
    const structure = getStructureData();

    const headerLabels = [];
    const matchups = [];

    const updateHeaders = function () {
      const remainingCounts = new Map();
      for (const matchup of matchups) {
        for (const div of matchup.divs) {
          if (!remainingCounts.has(div)) {
            remainingCounts.set(div, settings.numGames - matchup.numGames);
          } else {
            const oldVal = remainingCounts.get(div);
            remainingCounts.set(div, oldVal - matchup.numGames);
          }
        }
      }
      console.log(headerLabels);
      for (const headerLabel of headerLabels) {
        const matches = headerLabel.textContent.matchAll(/\d+/gm);
        console.log(matches.length);

        let subLeague = 1;
        let showSubLeague = false;

        if (headerLabel.textContent.startsWith("Sub League")) {
          subLeague = Number(matches.next().value[0]);
          console.log(`SL: ${subLeague}`);
          showSubLeague = true;
        }
        const division = Number(matches.next().value[0]);
        console.log(`DIV: ${division}`);
        const games = remainingCounts.get(
          division * (subLeague === 1 ? 1 : -1)
        );
        console.log(`Games: ${games}`);

        headerLabel.textContent = `${
          showSubLeague ? `Sub League ${subLeague} ` : ""
        } Division ${division} - Games Remaining ${games}`;
      }
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
          const slFactor = i === 0 ? 1 : -1;
          const matchup = new Matchup(
            0,
            (j + 1) * slFactor,
            (k + 1) * slFactor
          );
          matchups.push(matchup);

          const matchupContainer = document.createElement("div");
          matchupContainer.classList.add("division-matchup");
          divScheduleContainer.appendChild(matchupContainer);

          const inputId = createInputId(i + 1, j + 1, i + 1, k + 1);

          const matchupLabel = document.createElement("label");
          matchupLabel.setAttribute("for", inputId);
          matchupLabel.textContent =
            j === k
              ? "Games vs Own Division"
              : `Games vs Sub League ${i + 1} Division ${k + 1}`;
          matchupContainer.appendChild(matchupLabel);

          const matchupInput = document.createElement("input");
          matchupInput.setAttribute("type", "number");
          matchupInput.setAttribute("id", inputId);
          matchupInput.setAttribute("name", inputId);
          matchupInput.setAttribute("value", "0");
          matchupContainer.appendChild(matchupInput);

          const matchupSpan = document.createElement("span");
          matchupSpan.setAttribute(
            "id",
            createSpanId(i + 1, j + 1, i + 1, k + 1)
          );
          matchupSpan.textContent = "(0 games per opponent)";
          matchupContainer.appendChild(matchupSpan);

          matchupInput.addEventListener("change", function () {
            const newTotal = Number(matchupInput.value);
            matchup.numGames = newTotal;

            const opponents = j === k ? subLeague[k] - 1 : subLeague[k];

            matchupSpan.textContent = `(${Math.trunc(
              newTotal / opponents
            )} games per opponent${
              newTotal % opponents === 0
                ? ""
                : ` and ${newTotal % opponents} extra`
            })`;
            updateHeaders();
          });
        }
      }
    }
  });
};