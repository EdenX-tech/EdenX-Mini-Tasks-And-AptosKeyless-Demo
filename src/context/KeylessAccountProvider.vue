<template>
  <div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import { Account } from '@aptos-labs/ts-sdk';

export default Vue.extend({
  data() {
    return {
      keylessAccount: null as Account | null,
    };
  },
  provide() {
    return {
      keylessAccount: () => this.keylessAccount,
      setKeylessAccount: (account: Account | null) => this.keylessAccount = account,
    };
  },
  methods: {
    setKeylessAccount(account: Account | null) {
      this.keylessAccount = account;
    }
  }
});
</script>