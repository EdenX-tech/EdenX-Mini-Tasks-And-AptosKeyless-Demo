<template>
  <div class="container">
    <div class="wallet-content">
      <h1>Wallet</h1>
      <p>Address: {{ accountAddress }}</p>
      <p>APT Balance: {{ aptBalance }}</p>

      <div v-if="nfts && nfts.length">
        <h2>Collections</h2>
        <div class="nft-list">
          <div v-for="(nft, index) in nfts" :key="index" class="nft-item">
            <p>{{ nft.current_collection_data.collection_name }}</p>
            <img :src="nft.current_token_data.metadata_uri" alt="NFT Image" class="nft-image" />
            <p>{{ nft.current_collection_data.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

.container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  background-color: #000;
  color: #fff;
  min-height: 100vh;
  padding-bottom: 0; /* 确保没有额外的padding */
}

.wallet-content {
  text-align: center;
}

.nft-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 5px;
  margin-top: 20px;
}

.nft-item {
  flex: 0 0 calc(50% - 5px);
  max-width: 300px;
  box-sizing: border-box;
  text-align: center;
}

.nft-image {
  width: 170px;
  height: 170px;
  display: block;
  margin: 0 auto;
}

.mint-button-container {
  display: flex;
  justify-content: center;
  margin-top: 40px;
}

.mint-button {
  background-color: #4CAF50;
  color: white;
  font-size: 18px;
  padding: 15px 30px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.mint-button:hover {
  background-color: #45a049;
}

.mint-success-popup {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border: 2px solid #4CAF50;
  border-radius: 10px;
  text-align: center;
}

.mint-success-popup button {
  margin-top: 10px;
}
</style>
<script>
import { getAptosClient } from '@/utils/aptosClient';
import { getaptosndexerClient } from '@/utils/aptosIndexerClient'

export default {
  inject: ['keylessAccount'],
  data() {
    return {
      aptBalance: 0,
      accountAddress: 0,
      nfts: []
    };
  },
  async mounted() {
    const aptosClient = getAptosClient();
    const keylessAccount = this.keylessAccount();
    if (keylessAccount) {
      this.accountAddress = keylessAccount.accountAddress.toString();
    } else {
      console.error("keylessAccount is undefined.");
    }
    const accountCoinsData = await aptosClient.getAccountCoinsData({
      accountAddress: this.accountAddress,
    });
    console.log("accountCoinsData:", accountCoinsData);
    this.aptBalance = accountCoinsData[0]?.amount / 100_000_000 || 0;
    this.nfts = await this.getNfts();
    console.log("nfts:", this.nfts);
  },
  methods: {
    async getNfts() {
        const aptosIndexerClient = getaptosndexerClient();
        const accountNFTs = await aptosIndexerClient.getAccountNFTs(this.accountAddress);
        return accountNFTs.current_token_ownerships;
    }
  }
};
</script>