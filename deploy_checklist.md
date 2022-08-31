# Deploy Checklist

The purpose of this checklist is to do a quick sanity check to ensure the main function are working after every single deploy of the dapp.

## How/When

This checklist will be reviewed twice:

- _Before the deploy_: First, by the developer that wants to push `prod` branch and deploy to netlify. Point to `mainnet` locally.
- _After the deploy_: A different member of the team will go through the checklist on `www.babylon.finance`.

## Checklist

- [ ] Can load My Gardens Page
- [ ] Can load a specific garden page
- [ ] Can open deposit modal, change amount and deposit via tx. Metamask confirmation dialog pops up.
- [ ] Can open deposit modal, change amount and deposit via sig. Metamask signature dialog pops up.
- [ ] Can open withdraw modal, change amount and withdraw via tx. Metamask confirmation dialog pops up.
- [ ] Can open withdraw modal, change amount and withhdraw via sig. Metamask signature dialog pops up.
- [ ] Can create a strategy with default parameters. Metamask confirmation dialog pops up.
- [ ] Can create a garden with default parameters. Metamask coonfirmation dialog pops up.
