const { KeyValueStoreClient } = require('defender-kvstore-client');

export function getStore(event) {
  return new KeyValueStoreClient(event);
}
