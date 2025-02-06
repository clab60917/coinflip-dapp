# CoinFlip DApp Frontend

Une application décentralisée de pile ou face sur la blockchain Polygon, permettant aux joueurs de parier des tokens (USDC/USDT) dans des parties publiques ou privées.

## Fonctionnalités

- Connection wallet avec WalletConnect
- Support des tokens USDC et USDT
- Création de parties publiques ou privées
- Système de parties privées avec clé secrète
- Animation du flip de la pièce
- Statistiques des joueurs
- Interface utilisateur moderne avec Chakra UI
- Support du mode sombre

## Configuration

1. Créez un compte sur [WalletConnect Cloud](https://cloud.walletconnect.com/) et obtenez un Project ID

2. Créez un compte sur [Alchemy](https://dashboard.alchemy.com/) et créez une app pour obtenir une API key

3. Copiez le fichier `.env.example` en `.env`:
```bash
cp .env.example .env
```

4. Remplissez les variables dans `.env`:
```env
VITE_WALLET_CONNECT_PROJECT_ID=votre_project_id_walletconnect
VITE_ALCHEMY_API_KEY=votre_api_key_alchemy
VITE_CONTRACT_ADDRESS=adresse_du_contrat_deploye
```

## Installation

1. Installez les dépendances:
```bash
npm install
```

2. Lancez le serveur de développement:
```bash
npm run dev
```

3. Ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur

## Utilisation

1. Connectez votre wallet (MetaMask ou WalletConnect)
2. Assurez-vous d'être sur le réseau Mumbai testnet
3. Approuvez les tokens USDC/USDT pour le contrat (si ce n'est pas déjà fait)
4. Créez une nouvelle partie ou rejoignez une partie existante
5. Pour une partie privée:
   - Le créateur reçoit une clé privée à partager avec son adversaire
   - L'adversaire doit entrer cette clé pour rejoindre la partie
