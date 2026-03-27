let currentState = welcoming;

export function handleInput(sInput) {
  return currentState(sInput);
}

export function clearInput() {
  currentState = welcoming;
}

// STATE 1: Welcome
function welcoming() {
  let aReturn = [];
  currentState = coffeeDecision;
  aReturn.push("Would you like a coffee?");
  return aReturn;
}

// STATE 2: Coffee yes/no
function coffeeDecision(sInput) {
  let aReturn = [];

  if (sInput.toLowerCase().startsWith("y")) {
    currentState = temperature;
    aReturn.push("Iced or hot?");
  } else {
    currentState = welcoming;
    aReturn.push("Maybe next time. Have a good day!");
  }

  return aReturn;
}

// STATE 3: Iced or hot
function temperature(sInput) {
  let aReturn = [];
  currentState = milkChoice;
  aReturn.push("Regular milk or oat milk?");
  return aReturn;
}

// STATE 4: Milk choice
function milkChoice(sInput) {
  let aReturn = [];
  currentState = bagelChoice;
  aReturn.push("Would you like a bagel with that?");
  return aReturn;
}

// STATE 5: Up sell Bagel
function bagelChoice(sInput) {
  let aReturn = [];
  currentState = welcoming;
  aReturn.push("Great! Your order will be ready in 10 minutes.");
  return aReturn;
}