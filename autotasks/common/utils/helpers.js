const { ethers } = require('ethers');

function eth(value = 1) {
  return ethers.utils.parseEther(value.toString());
}

function sortBN(pick) {
  return (a, b) => {
    if (pick(a).gt(pick(b))) {
      return 1;
    }
    if (pick(a).lt(pick(b))) {
      return -1;
    }
    return 0;
  };
}

module.exports = {
  from: ethers.BigNumber.from,
  parse: ethers.utils.parseEther,
  parseUnits: ethers.utils.parseUnits,
  eth,
  sortBN,
};
