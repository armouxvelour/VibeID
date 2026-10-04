<p align="center">
  <img src="./public/logo.png" width="550" alt="VibeID logo">
</p>

<h1 align="center">VibeID</h1>

<p align="center">
  Wallet profiles and on-chain identity for Robinhood Chain Testnet.
</p>

VibeID turns your on-chain activity into a profile with a Vibe Score based on how you use the network.

### Vibe Score

Your score reflects:

- Activity — 200
- Exploration — 200
- Consistency — 150
- Diversity — 150
- Experimentation — 150
- Builder — 150

VibeID does **not** use wallet balances or profit to calculate your score.

### Setup

1. `npm install`
2. `cp .env.example .env.local`
3. Add a free WalletConnect project ID from [Reown](https://cloud.reown.com)
4. `npm run dev`

### Achievement Contract

Deploy the contract with Foundry:

```bash
forge create contracts/VibeIDAchievements.sol:VibeIDAchievements \
  --rpc-url https://rpc.testnet.chain.robinhood.com \
  --private-key $KEY