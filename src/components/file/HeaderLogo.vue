<template>
  <img
    v-if="storageConfigStore.globalConfig.siteHomeLogo"
    id="zfile-home-logo"
    :src="storageConfigStore.globalConfig.siteHomeLogo"
    class="my-auto mr-2 h-6 cursor-pointer"
    @click="openLink"
  />
</template>

<script setup>
import useStorageConfigStore from '~/stores/storage-config';
let storageConfigStore = useStorageConfigStore();

const openLink = () => {
  if (storageConfigStore.globalConfig.siteHomeLogoLink) {
    if (storageConfigStore.globalConfig.siteHomeLogoTargetMode === '_blank') {
      window.open(storageConfigStore.globalConfig.siteHomeLogoLink);
    } else {
      location.href = storageConfigStore.globalConfig.siteHomeLogoLink;
    }
  }
};
</script>

<style scoped></style>
