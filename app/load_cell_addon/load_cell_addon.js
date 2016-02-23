var addon = require('./build/Release/load_cell_addon');

getLoadCellWeight = function() {
  return addon.getCurrentWeight();
};

console.log(getLoadCellWeight()); // 'world'
