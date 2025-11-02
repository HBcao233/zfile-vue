<template>
  <div class="zfile-file-upload-body">
    <el-dialog
      v-if="visible"
      v-model="visible"
      :destroy-on-close="true"
      :title="uploadMode === 'file' ? '上传文件' : '上传文件夹'"
      draggable
      top="5vh"
      width="70%"
      @close="closeDialog"
    >
      <el-upload ref="uploadRef" drag :http-request="beforeUpload" :show-file-list="false" multiple>
        <i-custom-upload class="mx-auto text-7xl" />
        <div class="el-upload__text text-gray-400">
          <span v-show="uploadMode === 'file'">
            拖拽文件到这里或<em> 点击上传</em>, 上传至
            <em>{{ currentPath }}</em>
          </span>
          <span v-show="uploadMode === 'folder'">
            点击选择文件夹上传, 上传至 <em>{{ currentPath }}</em>
            <br />
            <span class="text-gray-400">（此处不支持拖拽文件夹，只支持点击选择文件夹）</span>
          </span>
        </div>
      </el-upload>

      <div class="mt-4">
        <div class="">
          <!-- Body -->
          <div class="space-y-7">
            <div v-for="item in uploadProgressInfoSorted" :key="item.index">
              <!-- Uploading File Content -->
              <div class="mb-2 flex items-start justify-between">
                <div class="mr-2 flex w-full items-center gap-x-3">
                  <svg-icon class="h-9 w-9 py-0.5" :name="'file-type-' + getFileIconName(item)">
                  </svg-icon>
                  <div class="w-full">
                    <p
                      class="mr-10 line-clamp-1 text-sm font-medium text-gray-800"
                      :title="item.name"
                    >
                      {{ item.name }}
                    </p>

                    <div class="flex space-x-2 text-xs max-sm:justify-between sm:space-x-4">
                      <p class="whitespace-nowrap text-gray-500">
                        {{ fileSizeFormat(item.size) }}
                      </p>

                      <template v-if="item.status === 'uploading'">
                        <p class="line-clamp-1 max-sm:hidden">{{ item.speed }}/秒</p>
                        <p class="line-clamp-1">
                          {{ fileSizeFormat(item.loaded) }}/{{ fileSizeFormat(item.size) }}
                        </p>
                      </template>

                      <p
                        v-show="item.msg"
                        class="line-clamp-1"
                        :class="{ 'text-red-500': item.status === 'error' }"
                      >
                        {{ item.msg }}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="inline-flex items-center gap-x-2">
                  <CheckCircleIcon
                    v-if="item.status === 'finished'"
                    class="box animate__animated animate__fadeIn inline h-[18px] text-green-500"
                  />
                  <ClockIcon
                    v-else-if="item.status === 'waiting'"
                    class="box animate__animated animate__fadeIn inline h-[18px] text-yellow-500"
                  />

                  <!--<TrashIcon v-if="item.status === 'uploading'" @click="cancelUpload(item)" class="w-6 text-red-500 box animate__animated animate__fadeIn cursor-pointer hover:bg-gray-200 rounded-full"/>-->
                  <XMarkIcon
                    v-if="item.status === 'uploading'"
                    class="box animate__animated animate__fadeIn h-5 w-5 cursor-pointer rounded-full text-gray-500 hover:bg-gray-200"
                    @click="cancelUpload(item)"
                  />
                  <ArrowPathIcon
                    v-else-if="item.status === 'error'"
                    class="box animate__animated animate__fadeIn h-4 w-4 cursor-pointer rounded-full text-red-500 hover:bg-gray-200"
                    @click="retryUpload(item)"
                  />
                  <TrashIcon
                    v-else-if="item.status === 'finished' || item.status === 'waiting'"
                    class="box animate__animated animate__fadeIn h-4 w-4 cursor-pointer rounded-full text-red-500 hover:bg-gray-200"
                    @click="removeUploadFileByIndex(item.index)"
                  />
                </div>
              </div>
              <!-- End Uploading File Content -->

              <!-- Progress Bar -->
              <div class="zfile-upload-item__progress">
                <el-progress
                  v-if="item.status === 'finished'"
                  :show-text="false"
                  :percentage="item.progress"
                  status="success"
                ></el-progress>
                <el-progress
                  v-else-if="item.status === 'uploading'"
                  :show-text="false"
                  :percentage="item.progress"
                ></el-progress>
                <el-progress
                  v-else-if="item.status === 'error'"
                  :show-text="false"
                  :percentage="100"
                  status="exception"
                ></el-progress>
                <el-progress
                  v-else-if="item.status === 'waiting'"
                  :show-text="false"
                  :percentage="0"
                ></el-progress>
              </div>
              <!-- End Progress Bar -->
            </div>
          </div>
          <!-- End Body -->
        </div>
      </div>
    </el-dialog>

    <!-- 文件拖拽提示框-->
    <div
      v-if="storageConfigStore.permission.upload"
      v-show="dropState"
      id="dropBox"
      ref="dropBoxRef"
      class="drop-view"
    >
      <div class="drop-sub">
        <span>上传文件至 {{ currentPath }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { fileSizeFormat, getFileIconName } from '~/utils';
import {
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/vue/24/outline';

let router = useRouter();
let route = useRoute();

import useFileSelect from '~/composables/file/useFileSelect';
let { currentPath } = useFileSelect();

import useFileUpload from '~/composables/file/useFileUpload';
const {
  visible,
  uploadMode,
  cancelUpload,
  beforeUpload,
  uploadProgressInfoSorted,
  dropState,
  listenDropFile,
  clearALlFinishedUploadFile,
  removeUploadFileByIndex,
  retryUpload,
} = useFileUpload();

import useStorageConfigStore from '~/stores/storage-config';
let storageConfigStore = useStorageConfigStore();

import useFileDataStore from '~/stores/file-data';
let fileDataStore = useFileDataStore();

// 如果有上传完成的文件，关闭对话框时调用 close 方法刷新文件列表
const emit = defineEmits();
const closeDialog = () => {
  let deleteCount = clearALlFinishedUploadFile();
  if (deleteCount > 0) {
    emit('close');
  }
};

// 监听拖拽上传
const dropBoxRef = ref();
onMounted(() => {
  listenDropFile();
});
</script>

<style scoped lang="scss">
.zfile-file-upload-body {
  :deep(.el-dialog__header) {
    text-align: center;
  }

  :deep(.el-dialog__body) {
    max-height: 80vh;
    overflow-y: auto;
    overflow-x: hidden;
  }

  :deep(.el-upload-dragger) {
    @apply border-2 border-dashed;
  }

  .drop-view {
    @apply fixed bottom-0 left-0 z-10
    flex h-full
    w-full flex-row
    items-center justify-center bg-black bg-opacity-20;

    .drop-sub {
      @apply flex h-5/6 w-5/6 items-center justify-center
      rounded-2xl border-2 border-dashed border-gray-400
      text-2xl font-bold text-gray-500;
    }
  }

  .zfile-upload-body {
    @apply mt-5 flex w-full flex-row space-y-2.5;

    .zfile-upload-item {
      @apply flex w-full;

      .zfile-upload-item-icon {
        @apply mr-2 p-1.5;
        svg {
          height: 1em;
          width: 1em;
        }
      }

      &__info {
        @apply flex w-full flex-col justify-between py-2.5 sm:py-3;
      }

      &__left {
        @apply flex w-full flex-col justify-center sm:flex-row;
      }

      &__status-icon {
        @apply inline flex-shrink-0 truncate;
        svg {
          @apply inline cursor-pointer rounded-full hover:bg-gray-200;
        }
      }
    }
  }
}
</style>
