<template>
  <div class="container" :class="{ 'blurred': isModalOpen }">
    <div class="content">
      <h1>EdenX Tasks</h1>
      <p>Just tap your fingers and easily get your points!</p>
    </div>

    <div class="login-container">
      <h2>Generate Wallet with your Google account</h2>
      <p>Your wallet will automatically sync across all devices with the introduction of Aptos Keyless technology. Whether you’re using Chrome or Telegram, or switching between different sessions, you’ll consistently have access to the same wallet.</p>
      <button @click="generateGoogleLoginUrl" class="google-button">
        <img src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png" alt="Google Logo" class="google-logo" />
        {{ account_exist ? 'Logout' : 'Continue with Google' }}
      </button>
    </div>

    <div class="tasks-button">
      <button @click="learn">{{ is_earn == 2 ? 'Learn to Earn' : 'Learn'}}</button>
      <button @click="checkIn">Daily Check-in</button>
      <button @click="viewWallet">View Wallet Assets</button>

    </div>

    <div class="medallions-container">
      <h2>EdenX OAT</h2>
      <p>Hurry up and answer the questions, complete tasks to earn points, and redeem your exclusive OAT!</p>
      <div class="medallions">
        <img v-for="(medallion, index) in medallions" :key="index" :src="medallion.src" :alt="'Medallion ' + (index + 1)" @click="goToMintPage(index)" />
      </div>
    </div>

    <div v-if="isModalOpen">
      <div class="modal-overlay" @click="closeModal"></div>
      <div class="modal">
        <div class="modal-content">
          <div class="modal-left">
            <img :src="selectedMedallion.src" alt="NFT Image" class="modal-image">
          </div>
          <div class="modal-right">
            <h2>{{ selectedMedallion.collectionName }}</h2>
            <p>{{ selectedMedallion.description }}</p>
            <button @click="handleMint(selectedMedallion.index)">{{mintStatus}}</button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showMintSuccess" class="mint-success-popup">
      <p>{{ decryptedText }}</p>
      <button @click="closeMintSuccess">Close</button>
    </div>
  </div>
</template>

<script>
import useEphemeralKeyPair from '@/hooks/useEphemeralKeyPair.ts';
import {getAptosClient} from "@/utils/aptosClient";
import axios from "axios";
import CryptoJS from "crypto-js";


export default {
  inject: ['keylessAccount'],
  data() {
    return {
      is_earn: 0,
      account_exist: false,
      isModalOpen: false,
      showMintSuccess: false,
      mintStatus: 'MINT',
      address: '',
      selectedMedallion: {
        collectionName: '',
        description: '',
        tokenName: '',
        src: '',
        index: 0,
      },
      decryptedText: 'Success!',
      medallions: [
        {
          collectionName: 'EDENX NOVICE OAT',
          description: 'EDENX NOVICE OAT',
          tokenName: 'Token 名称',
          src: 'https://zansen.s3.ap-east-1.amazonaws.com/zansen/b2a9dbd52024082822194810114.gif'
        },
        {
          collectionName: 'EDENX BEGINNER OAT',
          description: 'EDENX BEGINNER OAT',
          tokenName: 'EDENX BEGINNER OAT',
          src: 'https://zansen.s3.ap-east-1.amazonaws.com/zansen/c9cedacd2024082920051972626.gif'
        },
        {
          collectionName: 'EDENX INTERMEDIATE OAT',
          description: 'EDENX INTERMEDIATE OAT',
          tokenName: 'EDENX INTERMEDIATE OAT',
          src: 'https://zansen.s3.ap-east-1.amazonaws.com/zansen/bec383562024082920085162199.gif'
        }
      ]
    };
  },
  async mounted() {
    const keylessAccount = this.keylessAccount();
    const accountAddress =  keylessAccount.accountAddress.toString();
    this.address = accountAddress;

    console.log(accountAddress);
    if (keylessAccount) {
      this.account_exist = true;
      localStorage.setItem('account_exist', JSON.stringify(keylessAccount));
    } else {
      const accountExist = localStorage.getItem('account_exist');
      this.account_exist = accountExist === 'true';
    }
    this.is_earn = await this.getUserMintOATStatus(accountAddress, 0)
  },
  methods: {
    async learn() {
      var responseMessage;
      if (this.is_earn == 2) {

        console.log('data:', this.address);
        try {
          const response = await axios.post(
              process.env.VUE_APP_LEARN,
              { address: this.address },
              {
                headers: {
                  'Accept-Language': 'en-US', // 添加 Accept-Language 头
                },
              }
          );
          // 处理成功响应
          responseMessage = response.data.data.data;
          var result = JSON.parse(this.decryptData(responseMessage))
          if (result.is_earn == true) {
            const octa = result.amount;
            const apt = octa / 10**8;
            this.decryptedText = 'Congratulations! You’ve received a reward of ' + apt + ' $APT.';
            this.showMintSuccess = true;
          } else {
            this.decryptedText = 'Congratulations on answering correctly! Keep answering for a chance to win $APT rewards.';
            this.showMintSuccess = true;
          }
        } catch (error) {
          // 处理错误响应
          responseMessage = `Error: ${error.response ? error.response.data.message : error.message}`;
        }

        console.log("responseMessage:", responseMessage)
      } else {
        console.log("responseMessage error")
      }
    },
    async checkIn() {
      const aptosClient = getAptosClient();
      const keylessAccount = this.keylessAccount();
      if (!keylessAccount) {
        console.error("keylessAccount is undefined.");
        return;
      }
      const accountAddress =  keylessAccount.accountAddress.toString();

      const transaction = await aptosClient.transaction.build.simple({
        sender: accountAddress,
        data: {
          function: process.env.VUE_APP_SENDER + `::proof_of_achievement::sign_in`,
          typeArguments: [],
          functionArguments: [],
        },
      });
      try {
        const committedTxn = await aptosClient.signAndSubmitTransaction({
          signer: keylessAccount,
          transaction,
        });
        await aptosClient.waitForTransaction({
          transactionHash: committedTxn.hash,
        });
        console.log("success:", committedTxn);
        // 显示Mint成功的弹窗
        this.showMintSuccess = true;
      } catch (error) {
        console.error("error:", error);
      }
    },
    async viewWallet() {
      if (this.account_exist) {
        await this.$router.push({
          path: '/dashboard',
        });
      } else {
        this.generateGoogleLoginUrl()
      }
    },
    goToMintPage(index) {
      console.log("index:", index);

      console.log("medallions:", this.medallions[0]);
      this.selectedMedallion.collectionName = this.medallions[index].collectionName
      this.selectedMedallion.description = this.medallions[index].description
      this.selectedMedallion.tokenName = this.medallions[index].tokenName
      this.selectedMedallion.src = this.medallions[index].src
      this.selectedMedallion.index = index

      console.log(this.selectedMedallion)
      this.isModalOpen = true;
      // document.body.classList.add('modal-open');
    },
    // openModal(nft) {
    //
    // },
    async handleMint(index) {
      const aptosClient = getAptosClient();
      const keylessAccount = this.keylessAccount();
      if (!keylessAccount) {
        console.error("keylessAccount is undefined.");
        return;
      }
      const accountAddress =  keylessAccount.accountAddress.toString();
      // const res = await this.getUserMintOATStatus(accountAddress, index);
      // console.log("getUserMintOATStatus:", res)
      // return;
      const transaction = await aptosClient.transaction.build.simple({
        sender: accountAddress,
        data: {
          function: process.env.VUE_APP_SENDER + `::proof_of_achievement::mint_event_ticket`,
          typeArguments: [],
          functionArguments: [
            index
          ],
        },
      });

      console.log("transaction:", transaction);
      try {
        const committedTxn = await aptosClient.signAndSubmitTransaction({
          signer: keylessAccount,
          transaction,
        });
        await aptosClient.waitForTransaction({
          transactionHash: committedTxn.hash,
        });
        console.log("Mint OK:", committedTxn);
        // 显示Mint成功的弹窗
        this.mintStatus = "END";
      } catch (error) {
        console.error("Mint FAILED:", error);
        this.mintStatus = "FAILED";
      }
    },
    async getUserMintOATStatus(address, index) {
        const aptosClient = getAptosClient();
        const payload = {
          function: process.env.VUE_APP_SENDER + `::proof_of_achievement::get_user_mini_OAT_status`,
          typeArguments: [],
          functionArguments: [
              address,
              index
          ],
        };

        const chainId = (await aptosClient.view({ payload }))[0];
        console.log("getUserMintOATStatus111:", chainId);
        return chainId;
    },
    closeMintSuccess() {
      console.log("closeMintSuccess");
      this.showMintSuccess = false;
    },
    closeModal() {
      this.isModalOpen = false;
      // document.body.classList.remove('modal-open');
    },
    generateGoogleLoginUrl() {
      if (this.account_exist) {
        // 执行退出登录逻辑
        this.logout();
      } else {
        const ephemeralKeyPair = useEphemeralKeyPair();
        const redirectUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        const searchParams = new URLSearchParams({
          client_id: process.env.VUE_APP_GOOGLE_CLIENT_ID,
          redirect_uri: `${window.location.origin}/callback`,
          response_type: "id_token",
          scope: "openid email profile",
          nonce: ephemeralKeyPair.nonce,
        });
        redirectUrl.search = searchParams.toString();
        window.location.href = redirectUrl.toString();
      }
    },
    logout() {
      localStorage.removeItem('account_exist');
      this.account_exist = false;
      localStorage.setItem('account_exist', this.account_exist);
    },
    decryptData(encryptedData) {
      var key = CryptoJS.enc.Utf8.parse(process.env.VUE_APP_KEY);

      var bytes = CryptoJS.enc.Base64.parse(encryptedData);

      var iv = CryptoJS.lib.WordArray.create(bytes.words.slice(0, 4));
      var cipherText = CryptoJS.lib.WordArray.create(bytes.words.slice(4));

      var decrypted = CryptoJS.AES.decrypt(
          { ciphertext: cipherText },
          key,
          { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
      );

      return decrypted.toString(CryptoJS.enc.Utf8);
    }
  },
};
</script>

<style scoped>

html, body {
  height: 100%;
  margin: 0;
  font-family: Arial, sans-serif;
}
.container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 20px;
  box-sizing: border-box;
  background-color: #000;
  color: #fff;
}

.content {
  padding-top: 0;
}

.login-container {
  margin-top: -300px;
  margin-bottom: 10px;
  text-align: center;
}

.tasks-button {
  margin-top: -300px;
  margin-bottom: 20px;
  text-align: center;
}

.medallions {
  display: flex;
  justify-content: center;
  gap: 20px; /* Adjust this value to increase or decrease the spacing */
  margin-top: 20px;
}

button {
  width: 100%;
  margin: 5px 0;
  padding: 15px;
  border-radius: 10px;
  border: 2px solid #2b2b2b;
  background-color: transparent;
  color: white;
  cursor: pointer;
  font-size: 1.2rem;
}

button:first-child {
  background-color: #a2f2bd;
  color: black;
}

button:nth-child(2) {
  background-color: #709bf8;
}

button:last-child {
  background-color: #2b2b2b;
  color: white;
}

.medallions {
  display: flex;
  justify-content: space-around;
  width: 100%;
}

.medallions img {
  width: 100px;
  height: 100px;
  cursor: pointer;
  border: 2px solid white;
  border-radius: 10px;
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 10px;
  box-sizing: border-box;
}

h2 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

p {
  font-size: 16px;
  color: #666;
  margin-bottom: 10px;
  max-width: 600px;
}

.google-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-size: 18px;
  font-weight: bold;
  color: #fff;
  background-color: #fff;
  border: 2px solid;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.google-button:hover {
  background-color: #fff;
}

.google-logo {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.medallions {
  width: 100%;
  margin-top: 20px;
}

.medallions-container {
  text-align: center;
  margin-top: 20px;
}

.medallions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px; /* 确保图片与文字有一定的间距 */
}

.login-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: calc(100vh - 50px); /* 高度减去一些像素，使其向上移动 */
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
  margin-bottom: 50px; /* 添加底部外边距，使其整体向上移动 */
}

h2 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}

p {
  font-size: 16px;
  color: #666;
  margin-bottom: 30px;
  max-width: 600px; /* 限制文本宽度，使其更易阅读 */
}

.google-button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  font-size: 18px;
  font-weight: bold;
  color: #EA4335;
  background-color: #fff;
  //border: 2px solid #EA4335;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s, box-shadow 0.3s;
}

.google-button:hover {
  background-color: #f5f5f5;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.google-logo {
  width: 24px;
  height: 24px;
  margin-right: 10px;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000; /* 确保弹窗在覆盖层之上 */
  background-color: #000;
  color: #fff;
  width: 80%;
  max-width: 600px;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
}

.modal-content {
  display: flex;
  width: 100%;
}

.modal-left, .modal-right {
  padding: 20px;
}

.modal-left {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-right {
  flex: 2;
}

.modal-image {
  max-width: 100%;
  border-radius: 10px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7); /* 让背景变暗 */
  z-index: 999;
}
.modal-open .modal-overlay {
  display: block; /* 当弹窗打开时显示 */
}

.modal-open .container {
  filter: blur(5px); /* 让背景变得模糊 */
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