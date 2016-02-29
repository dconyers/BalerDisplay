let addon = require("./build/Release/load_cell_addon");


export function getLoadCellWeight() {
  return addon.getCurrentWeight();
}


// TODO: DEC - This printout must be removed before production;
// Just for debug/testing
console.log("answer: " + getLoadCellWeight());
