import mixpanel from 'mixpanel-browser';
import { IS_MAINNET } from 'config';
const env_check = process.env.NODE_ENV === 'production' && IS_MAINNET;

mixpanel.init('55b888c26e1f63935710a824a3c1f3f2', {
  debug: process.env.NODE_ENV !== 'production',
  ip: false,
  save_referrer: false,
  store_google: false,
});

export const Mixpanel = {
  identify: (id: string) => {
    if (env_check) mixpanel.identify(id);
  },
  alias: (id: string) => {
    if (env_check) mixpanel.alias(id);
  },
  track: (name: string, props: any) => {
    if (env_check) mixpanel.track(name, props);
  },
  people: {
    set: (props: any) => {
      if (env_check) mixpanel.people.set(props);
    },
  },
};
