import { ethers } from 'ethers';

const { BigNumber } = ethers;

/*
 * Return a new BigNumber whose value is the maximum of the arguments.
 *
 * arguments {number|string|BigNumber}
 */
BigNumber.max = function () {
  return maxOrMin(arguments, BigNumber.prototype.lt);
};

/*
 * Return a new BigNumber whose value is the minimum of the arguments.
 *
 * arguments {number|string|BigNumber}
 */
BigNumber.min = function () {
  return maxOrMin(arguments, BigNumber.prototype.gt);
};

// Handle BigNumber.max and BigNumber.min.
function maxOrMin(args, method) {
  var n,
    i = 1,
    m = BigNumber.from(args[0]);

  for (; i < args.length; i++) {
    n = BigNumber.from(args[i]);

    if (method.call(m, n)) {
      m = n;
    }
  }

  return m;
}

export { BigNumber };
