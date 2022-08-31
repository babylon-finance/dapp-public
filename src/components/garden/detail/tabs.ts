import { Tab } from 'models';

export const ADMIN_TABS = {
  strategies: { display: 'Strategies', value: Tab.STRATEGIES },
  gardens: { display: 'Gardens', value: Tab.GARDENS },
};

export const STRATEGY_TABS = {
  candidateStrategies: { display: 'Proposed', value: Tab.CANDIDATE },
  activeStrategies: { display: 'Active', value: Tab.ACTIVE },
  completedStrategies: { display: 'Finalized', value: Tab.COMPLETED },
  submitStrategy: { display: 'Submit New', value: Tab.SUBMIT_STRATEGY, icon: 'bow' },
};

export const GARDEN_ACTION_TABS = {
  performance: { display: 'Performance', value: Tab.PERFORMANCE },
  description: { display: 'Thesis', value: Tab.GARDEN_THESIS },
  properties: { display: 'Properties', value: Tab.GARDEN_PROPERTIES },
  members: { display: 'Babylonians', value: Tab.MEMBERS },
  //hof: { display: 'Hall of Fame', value: Tab.GARDEN_HOF },
};

export const MOBILE_GARDEN_ACTION_TABS = {
  properties: GARDEN_ACTION_TABS.properties,
  description: GARDEN_ACTION_TABS.description,
};

export const GARDENS_TABS = {
  portfolio: { display: 'My Portfolio', value: Tab.PORTFOLIO },
  invites: { display: 'Pending Invitations', value: Tab.INVITES },
  create: { display: 'Create Garden +', value: Tab.CREATE_GARDEN },
};

export const LEADERBOARD_TABS = {
  gardens: { display: 'Gardens', value: Tab.GARDENS },
};
