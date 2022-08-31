# Babylon Finance dApp

**Community-led Asset Management. Powered by DeFi.**

[![Netlify Status](https://api.netlify.com/api/v1/badges/8b2271df-75ae-4c22-9697-9cb9875c8795/deploy-status)](https://app.netlify.com/sites/stupefied-babbage-4b8c9c/deploys)

## 🚀 Quick Start

Required -- Node Version: 14.16.1

Install Netlify CLI

```bash
yarn global add netlify-cli
```

Git clone

```bash
git clone https://github.com/babylon-finance/dapp.git
```

Install dependencies

```bash
yarn
```

Add new network to MetaMask called `Mainnet Fork` with RPC URL `http://127.0.0.1:8545` and ChainId set to `31337`.

(Optional since protocol now also performs this step during yarn chain) Copy contracts build directory

```bash
yarn copy-contracts-hardhat
```

Add a new account to MetaMask by the private key and call it `Babylon Dev`

```bash
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

Add the credentials to `.env.development`.

[Create](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token) and save `GITHUB_TOKEN` in your .env file. Then login using `npm login` command and your GITHUB_TOKEN

```bash
npm login --scope=@babylon-finance --registry=https://npm.pkg.github.com
```

## 🏃 Running the dApp locally

Run local chain, deploy contracts, and export ABI json to `dapp` project

```bash
yarn chain
```

Copy the contracts over

```bash
yarn run copy-contracts-hardhat
```

Prepare lambdas and start local web server

```bash
yarn run-local
```

## 🏃 Running the dApp on mainnet

On the protocol, checkout the `stable` branch and run:

```bash
yarn run export:mainnet
```

Copy the contracts over

```bash
yarn run copy-contracts-mainnet
```

Change your `env.development` chain id to 1.

```bash
REACT_APP_CHAIN_ID=1
```

Prepare lambdas and start local web server

```bash
yarn run-local
```

Go to localhost:8888

## 🚧 Testing

List of accounts for local testing:

```bash
Accounts
========
Deployer #0: 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

Keeper #1: 0x70997970c51812dc3a010c7d01b50e0d17dc79c8 (10000 ETH)
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d

Owner #2: 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc (10000 ETH)
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a

Signer1 (has creator rights) #3: 0x90f79bf6eb2c4f870365e785982e1f101e93b906 (10000 ETH)
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6

Signer2 (no creator rights) #4: 0x15d34aaf54267db7d7c367839aaf71a00a2c6a65 (10000 ETH)
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a

Signer3 #5: 0x9965507d1a55bcc2695c58ba16fb37d819b0a4dc (10000 ETH)
Private Key: 0x8b3a350cf5c34c9194ca85829a2df0ec3153be0318b5e2d3348e872092edffba

[ CHASE ]
Signer4 #6: 0x976ea74026e726554db657fa54763abd0c3a0aa9 (10000 ETH)
Private Key: 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e

[ IGOR ]
Signer5 #7: 0x14dc79964da2c08b23698b3d3cc7ca32193d9955 (10000 ETH)
Private Key: 0x4bbbf85ce3377467afe5d46f804f221813b2bb87f24d81f60f1fcdbf7cbf4356

[ RAMON ]
Signer6 #8: 0x23618e81e3f5cdf7f54c3d65f7fbc0abf5b21e8f (10000 ETH)
Private Key: 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97

[ RAUL ]
Signer7 #9: 0xa0ee7a142d267c1f36714e4a8f75612f20a79720 (10000 ETH)
Private Key: 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6

[ TYLER ]
Signer8 #10: 0xbcd4042de499d14e55001ccbb24a551f3b954096 (10000 ETH)
Private Key: 0xf214f2b2cd398c806f84e317254e0f0b801d0643303237d97a22a48e01628897
```

If you do not see the balance of ERC20 tokens that you expect in MetaMask you likely will need to add them manually by pasting the token address into "Add Token" in metamask extension.

When testing locally, you may need to increase time in the protocol. Head to the protocol and run:

```bash
yarn increaseTime -—days 30
```

To run the keepers (make sure you run yarn install in autotasks/keeper first):

```bash
yarn run-keeper
```
