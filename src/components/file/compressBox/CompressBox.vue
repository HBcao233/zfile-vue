<template>
  <div class="zfile-compress-box">
    <el-dialog
      v-model="props.show"
      @close="handlerClose('cancel')"
      customClass="compress-message-box"
      showCancelButton
      draggable
    >
      <template #header>
        <div class="zfile-compress-box-header" v-html="props.title"></div>
      </template>
      <div class="zfile-compress-box-body">
        <el-form-item label="压缩包文件名">
          <el-input v-model="compressName" @inputValidator="inputValidator" placeholder="压缩包文件名" />
        </el-form-item>
        <el-form-item label="压缩包格式">
          <el-select placeholder="压缩包格式" v-model="compressType">
            <el-option
              v-for="item in constant.archives"
              :key="item.key"
              :value="item.key"
              :label="`${item.name} (${item.ext})`"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="分卷大小 (MB)">
          <el-input-number
            placeholder="分卷大小 (MB)"
            v-model="splitSizeMB"
            :min="0"
            :max="2048"
            :step="5"
          />
        </el-form-item>
      </div>
      <template #footer>
        <div class="zfile-compress-box-controls">
          <el-button type="info" @click="handlerClose('cancel')">取消</el-button>
          <el-button type="primary" :loading="loading" @click="handlerClose('confirm')"
            >确认</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { constant } from '~/constant';

import { inject } from 'vue';

// 组件传参及回写
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '压缩',
  },
  inputValue: {
    type: String,
    default: '/',
  },
  onClose: {
    type: Function,
    default: () => {},
  },
});

const inputValidator = (val) => {
  if (!val) {
    return '压缩包名称不能为空';
  }

  if (val.includes('/')) {
    return '压缩包名称不能包含 / (不支持多级创建)';
  }
  return true;
};

const compressName = ref(props.inputValue);
const compressType = ref('zip');
const splitSizeMB = ref(0);
const loading = inject('loading');

// 响应关闭事件
const emit = defineEmits(['update:show']);
const handlerClose = (type) => {
  const result = {
    type,
    compressName: compressName.value,
    compressType: compressType.value,
    splitSizeMB: splitSizeMB.value,
  };

  if (type === 'confirm') {
    loading.value = true;
  }

  emit('update:show', false);
  props.onClose(result);
};
</script>

<style lang="scss" scoped></style>
