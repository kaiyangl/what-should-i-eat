// State
let filteredData = [];
let processedData = [];
let loading = true;
let noDairy = false;
let noSeafood = false;
let preferMeat = false;
let preferVege = false;
let currentIndex = null;

// Elements
const suggestionButton = document.querySelector("#suggestion-button");
const result = document.querySelector("h2");
const findRecipeButton = document.querySelector("#find-recipe-button");
const extraButtonSection = document.querySelector(
  "#additional-buttons-wrapper"
);
const noButton = document.querySelector("#no-button");
const moreMeatButton = document.querySelector("#more-meat-button");
const moreVeggieButton = document.querySelector("#more-veggie-button");
const noDairyToggle = document.querySelector("#no-dairy");
const noSeafoodToggle = document.querySelector("#no-seafood");

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function filterData() {
  debugger;
  filteredData = processedData.filter((i) => {
    if (noDairy && i.tags.has("Dairy")) {
      return false;
    } else if (noSeafood && i.tags.has("Seafood")) {
      return false;
    } else if (preferMeat && !i.tags.has("Meat")) {
      return false;
    } else if (preferVege && !i.tags.has("Vegetable")) {
      return false;
    } else {
      return true;
    }
  });
}

// Result generator
function generateRandomResult() {
  let newIndex = getRandomInt(filteredData.length);
  while (filteredData.length !== 0 && newIndex === currentIndex) {
    newIndex = getRandomInt(filteredData.length);
  }
  currentIndex = newIndex;
  result.innerHTML = filteredData[newIndex].name;
}

// Handlers
function handleGiveInitialSuggestion() {
  suggestionButton.classList.add("hidden");
  generateRandomResult();
  result.classList.remove("hidden");
  findRecipeButton.classList.remove("hidden");
  extraButtonSection.classList.remove("hidden");
}

function handleMoreMeat() {
  preferMeat = true;
  preferVege = false;
  filterData();
  generateRandomResult();
}

function handleMoreVege() {
  preferVege = true;
  preferMeat = false;
  filterData();
  generateRandomResult();
}

function handleNoSeafoodToggle(e) {
  noSeafood = e.target.checked;

  // If has result and current result goes against this
  if (
    currentIndex !== null &&
    noSeafood &&
    noSeafood === filteredData[currentIndex].tags.has("Seafood")
  ) {
    filterData();
    generateRandomResult();
  } else {
    // Else
    filterData();
  }
}

function handleNoDairyToggle(e) {
  noDairy = e.target.checked;

  // If has result and current result goes against this
  if (
    currentIndex !== null &&
    noDairy &&
    noDairy === filteredData[currentIndex].tags.has("Dairy")
  ) {
    filterData();
    generateRandomResult();
  } else {
    // Else
    filterData();
  }
}

// setup handlers
suggestionButton.addEventListener("click", handleGiveInitialSuggestion);
noButton.addEventListener("click", generateRandomResult);
moreMeatButton.addEventListener("click", handleMoreMeat);
moreVeggieButton.addEventListener("click", handleMoreVege);
noSeafoodToggle.addEventListener("click", handleNoSeafoodToggle);
noDairyToggle.addEventListener("click", handleNoDairyToggle);

// fetch data and initialise
fetch("/api/index")
  .then((response) => response.json())
  .then((data) => {
    processedData = data.map((i) => ({
      name: i.name,
      vegetarian: i.vegetarian,
      tags: new Set(i.tags),
      type: new Set(i.type),
    }));
    filterData();
  });
