let addon = require("./build/Release/load_cell_addon");

export function getLoadCellWeight() {
  return addon.getCurrentWeight();
}
