"use strict";

const DIVISION_CLASS = "division-container";
const SUBLEAGUE_CLASS = "subleague-container";
const TEAM_CLASS = "team-container";

const MAX_TEAMS_DIVISION = 5;
const DEFAULT_TEAMS_DIVISION = 4;

window.onload = function () {
  const subleaguesSelect = document.getElementById("subleagues");
  const subleagueContainers = [
    ...document.querySelectorAll(`.${SUBLEAGUE_CLASS}`),
  ];

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
};
