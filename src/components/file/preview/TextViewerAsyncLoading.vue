<template>
  <div class="zfile-async-loading h-[75vh] w-full p-10">
    <div class="flex h-full justify-between">
      <div class="w-1/4">
        <el-skeleton animated :count="6" />
      </div>
      <div class="h-full w-20">
        <el-skeleton animated class="h-full">
          <template #template>
            <el-skeleton-item variant="rect" class="!h-full"></el-skeleton-item>
          </template>
        </el-skeleton>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped></style>
