const pinataSDK = require('@pinata/sdk');

let sdk;

module.exports = {
  getPinataSDK: function (key, secretKey) {
    if (sdk) {
      return sdk;
    } else {
      sdk = pinataSDK(key, secretKey);
      return sdk;
    }
  },
};
