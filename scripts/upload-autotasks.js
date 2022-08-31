require('dotenv').config({ path: '.env.development' });
const { AutotaskClient } = require('defender-autotask-client');

const process = require('process');

const DEFENDER_API_KEY = process.env.DEFENDER_API_KEY || '';
const DEFENDER_API_SECRET = process.env.DEFENDER_API_SECRET || '';

const KEEPER_ID = 'a71a95bc-34fc-4386-a87f-eccdb9576b65';
const SNAPPER_ID = 'a5a71e8a-012f-46d9-a5a2-8690775fe5ec';
const ACCOUNTANT_ID = '69535bac-dfb4-486e-bc1b-21d9fb13a09e';
const HEART_ID = '7b89faa7-e13d-4811-a4e8-1463f067f2a3';
const WHIP_ID = 'f5d949e3-69b4-4719-b917-452a72b3d81d';
const BANKER_ID = 'f5b50fdc-9d65-4ccf-847a-1721de8c1668';

const KEEPER_DIR = './autotasks/keeper/';
const SNAPPER_DIR = './autotasks/snapper';
const ACCOUNTANT_DIR = './autotasks/accountant/';
const HEART_DIR = './autotasks/heart/';
const WHIP_DIR = './autotasks/whip/';
const BANKER_DIR = './autotasks/banker/';

const client = new AutotaskClient({ apiKey: DEFENDER_API_KEY, apiSecret: DEFENDER_API_SECRET });

const validTasks = {
  keeper: 'keeper',
  snapper: 'snapper',
  accountant: 'accountant',
  heart: 'heart',
  whip: 'whip',
  banker: 'banker',
};

// Usage: node update-autotasks.js keeper snapper ...
async function main() {
  const tasksToUpdate = process.argv.slice(2);
  const allTasksValid = tasksToUpdate.every((task) => Object.keys(validTasks).includes(task));

  if (tasksToUpdate.length === 0) {
    throw new Error(`Must provide task to update!`);
  }

  if (!allTasksValid) {
    throw new Error(`Invalid task list: ${tasksToUpdate} | Valid tasks are: ${Object.keys(validTasks)}`);
  }

  if (tasksToUpdate.includes(validTasks.keeper)) {
    await client.updateCodeFromFolder(KEEPER_ID, `${KEEPER_DIR}/dist/`);
    console.log('Updated KEEPER autotask code');
  }

  if (tasksToUpdate.includes(validTasks.snapper)) {
    await client.updateCodeFromFolder(SNAPPER_ID, `${SNAPPER_DIR}/dist/`);
    console.log('Updated SNAPPER autotask code');
  }

  if (tasksToUpdate.includes(validTasks.accountant)) {
    await client.updateCodeFromFolder(ACCOUNTANT_ID, `${ACCOUNTANT_DIR}/dist/`);
    console.log('Updated ACCOUNTANT autotask code');
  }

  if (tasksToUpdate.includes(validTasks.banker)) {
    await client.updateCodeFromFolder(BANKER_ID, `${BANKER_DIR}/dist/`);
    console.log('Updated BANKER autotask code');
  }

  if (tasksToUpdate.includes(validTasks.heart)) {
    await client.updateCodeFromFolder(HEART_ID, `${HEART_DIR}/dist/`);
    console.log('Updated HEART autotask code');
  }

  if (tasksToUpdate.includes(validTasks.whip)) {
    await client.updateCodeFromFolder(WHIP_ID, `${WHIP_DIR}/dist/`);
    console.log('Updated WHIP autotask code');
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
