<template>
  <div class="toolbar">
    <div class="item">
      <label for="language">语言:</label>
      <el-select
        v-model="configComputed.language"
        placeholder="请选择"
        :disabled="disabled"
        class="w-32"
        size="small"
        @change="handleSelectLanguage"
      >
        <el-option v-for="option in languages" :key="option" :label="option" :value="option">
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <label for="language">编码:</label>
      <el-select
        v-model="configComputed.encoding"
        placeholder="请选择"
        :disabled="disabled"
        class="w-32"
        size="small"
        @change="handleSelectEncoding"
      >
        <el-option v-for="option in encodings" :key="option" :label="option" :value="option">
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <label for="theme">主题:</label>
      <el-select
        v-model="configComputed.theme"
        placeholder="请选择"
        :disabled="disabled"
        class="w-20"
        size="small"
      >
        <el-option
          v-for="option in ['default', ...themes]"
          :key="option"
          :label="option"
          :value="option"
        >
        </el-option>
      </el-select>
    </div>
    <div class="item">
      <label for="disabled">只读:</label>
      <el-checkbox
        id="disabled"
        v-model="configComputed.readonly"
        :disabled="disabled"
        size="small"
      >
      </el-checkbox>
    </div>
    <div class="item">
      <label for="lineWrapping">自动换行:</label>
      <el-checkbox
        id="lineWrapping"
        v-model="configComputed.lineWrapping"
        :disabled="disabled"
        size="small"
      >
      </el-checkbox>
    </div>
    <div v-show="false" class="item">
      <label for="autofocus">autofocus:</label>
      <el-checkbox
        id="autofocus"
        v-model="configComputed.autofocus"
        :disabled="disabled"
        size="small"
      >
      </el-checkbox>
    </div>
    <div v-show="false" class="item">
      <label for="indentWithTab">indentWithTab:</label>
      <el-checkbox
        id="indentWithTab"
        v-model="configComputed.indentWithTab"
        :disabled="disabled"
        size="small"
      >
      </el-checkbox>
    </div>
    <div v-show="false" class="item">
      <label for="tabSize">tabSize:</label>
      <el-select
        id="tabSize"
        v-model.number="configComputed.tabSize"
        placeholder="请选择"
        :disabled="disabled"
        class="w-12"
        size="small"
      >
        <el-option v-for="option in [2, 4, 6, 8]" :key="option" :label="option" :value="option">
        </el-option>
      </el-select>
    </div>
    <div v-show="false" class="item">
      <label for="height">height:</label>
      <el-select
        v-model="configComputed.height"
        placeholder="请选择"
        :disabled="disabled"
        class="w-16"
        size="small"
      >
        <el-option
          v-for="option in ['auto', '200px', '40em', '60vh']"
          :key="option"
          :label="option"
          :value="option"
        >
        </el-option>
      </el-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElSelect, ElOption, ElCheckbox } from 'element-plus';
import { PropType } from 'vue';
import { ToolBarConfig } from './types';

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  config: {
    type: Object as PropType<ToolBarConfig>,
    required: true,
  },
  languages: {
    type: Array as PropType<Array<string>>,
    required: true,
  },
  encodings: {
    type: Object as PropType<Record<string, string>>,
    required: false,
  },
  themes: {
    type: Array as PropType<Array<string>>,
    required: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['language', 'encoding', 'update:config']);

const configComputed = computed({
  get: () => props.config,
  set: (value) => {
    emits('update:config', value);
  },
});

const handleSelectLanguage = (value: string) => {
  emits('language', value);
};

const handleSelectEncoding = (value: string) => {
  emits('encoding', value);
};
</script>

<style lang="scss" scoped>
.toolbar {
  @apply grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5;

  .item {
    @apply my-1 flex space-x-1 sm:max-w-[80%] md:max-w-[70%] xl:max-w-[60%];

    label {
      @apply whitespace-nowrap;
    }
  }
}
</style>
