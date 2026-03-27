let currentState = welcoming;

export function handleInput(sInput) {
  return currentState(sInput);
}

export function clearInput(){
  currentState = welcoming;  
}

function welcoming() {
  let aReturn = [];
  currentState = reserving;
  aReturn.push("Welcome to Rich's Acton Rapid Test.");
  aReturn.push("Would you like to reserve a rapid test kit?");
  return aReturn;
}

function reserving(sInput) {
  let aReturn = [];
  currentState = welcoming
  if (sInput.toLowerCase().startsWith('y')) {
    aReturn.push(`Your rapid test is reserved`);
    let d = new Date();
    d.setMinutes(d.getMinutes() + 120);
    aReturn.push(`Please pick it up at 123 Tidy St., Acton before ${d.toTimeString()}`);
  } else {
    aReturn.push("Thanks for trying our reservation system");
    aReturn.push("Maybe next time");
  }
  return aReturn;
}