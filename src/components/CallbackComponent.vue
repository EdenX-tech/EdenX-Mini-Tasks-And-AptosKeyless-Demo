<template>
  <div>
    <h1>Login Callback</h1>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { getAptosClient } from '@/utils/aptosClient';
import { getLocalEphemeralKeyPair } from '@/hooks/useEphemeralKeyPair';
import { jwtDecode } from 'jwt-decode';

export default Vue.extend({
  inject: ['setKeylessAccount'],
  async mounted() {

    const parseJWTFromURL = (url) => {
      const urlObject = new URL(url);
      const fragment = urlObject.hash.substring(1);
      const params = new URLSearchParams(fragment);
      return params.get("id_token");
    };

    const jwt = parseJWTFromURL(window.location.href);

    if (jwt) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const payload = jwtDecode(jwt) as { nonce: string };
      // eslint-disable-next-line
      const jwtNonce = payload.nonce;
      const ephemeralKeyPair = getLocalEphemeralKeyPair(jwtNonce);
      // const publicKey = ephemeralKeyPair.publicKey;

      if (ephemeralKeyPair) {
        const aptosClient = getAptosClient();
        try {
          const keylessAccount = await aptosClient.deriveKeylessAccount({
            jwt,
            ephemeralKeyPair,
          });
          // eslint-disable-next-line
          /* eslint-disable */
          (this as any).setKeylessAccount(keylessAccount);
          if (keylessAccount) {
            await (this as any).$router.push({
              path: '/tasks',
            });
          }
        } catch (error) {
          console.error("Error deriving keyless account:", error);
        }
      } else {
        console.error("Failed to retrieve ephemeral key pair.");
      }
    } else {
      console.error("Failed to retrieve JWT.");
    }
  },
});
</script>