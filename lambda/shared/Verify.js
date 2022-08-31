const { TEST_ADDRESS } = require('../shared/constants.js');

const { getAddress } = require('@ethersproject/address');
const axios = require('axios');

const REQUIRED_DOMAIN = process.env.DEPLOY_ENV === 'production' ? 'www.babylon.finance' : 'localhost:8888';
const BABYLON_SECRET_KEY = process.env.BABYLON_SECRET_KEY;

module.exports = {
  verifyDomain: function (domain) {
    console.log('check domain', domain, REQUIRED_DOMAIN, domain === REQUIRED_DOMAIN);
    return true;
  },
  verifyToken: function (token) {
    return token === BABYLON_SECRET_KEY;
  },
  verifyTwitterHandle: async function (handle) {
    return axios.get(`http://twitter.com/${handle}`).then((resp) => {
      return resp.status === 200;
    });
  },
  verifyTestWallet: function (wallet) {
    return TEST_ADDRESS === wallet;
  },
  verifyAddress: function (address) {
    try {
      getAddress(address);
      return true;
    } catch (err) {
      return false;
    }
  },
};
