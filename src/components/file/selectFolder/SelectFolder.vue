<template>
  <div class="zfile-select-folder-body">
    <el-dialog v-model="props.show" @close="handlerClose('cancel')">
      <div class="zfile-select-folder-breadcrumb h-12">
        <breadcrumb class="h-12" :items="breadcrumbData" @breadcrumb-click="onClickBreadcrumb" />
      </div>
      <template #header>
        <div class="zfile-select-folder-header" v-html="title"></div>
      </template>
      <div v-loading="listLoading" class="zfile-select-folder-body">
        <nav class="space-y-1" aria-label="Sidebar">
          <a
            v-for="item in fileList"
            :key="item.name"
            :href="item.href"
            :class="[
              'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
              'group flex select-none items-center rounded-md px-3 py-2 text-sm font-medium',
            ]"
            @click="onChangePath(item)"
          >
            <i-custom-file-type-folder
              name="file-type-folder"
              class="mr-3 h-6 w-6 flex-shrink-0 text-2xl"
            />
            <span class="select-none truncate">{{ item.name }}</span>
          </a>
          <div v-if="fileList.length === 0">
            <div class="flex h-20 items-center justify-center">
              <span class="text-gray-500">无文件夹</span>
            </div>
          </div>
        </nav>
      </div>

      <div class="zfile-select-folder-footer">
        <div v-if="props.showDecompressOptions">
          <div class="zfile-select-folder-createDir">
            <el-checkbox v-model="createDir" label="解压到压缩包同名文件夹" />
          </div>
          <div class="zfile-select-folder-password">
            <el-input v-model="password" placeholder="解压密码 不存在请留空" />
          </div>
          <div class="zfile-select-folder-charset">
            <el-select v-model="charset" label="字符集" size="large">
              <el-option
                v-for="item in constant.charsets"
                :key="item.code"
                :value="item.code"
                :label="`${item.code} (${item.description})`"
              />
            </el-select>
          </div>
        </div>
        <div class="zfile-select-folder-controls">
          <div>
            <i-lucide-folder-plus
              v-show="storageConfigStore.permission.newFolder"
              class="h-6 w-6 cursor-pointer text-blue-400"
              @click="onNewFolder"
            />
          </div>
          <div>
            <el-button type="info" @click="handlerClose('cancel')">取消</el-button>
            <el-button type="primary" :loading="loading" @click="handlerClose('confirm')"
              >确认</el-button
            >
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { concatPath } from '~/utils';
import { ElMessage } from 'element-plus';

import { inject } from 'vue';
import { loadFileListReq } from '~/api/home/home';

import useStorageConfigStore from '~/stores/storage-config';
let storageConfigStore = useStorageConfigStore();

import useFilePwd from '~/composables/file/useFilePwd';
let { getPathPwd, putPathPwd } = useFilePwd();

import useFileOperator from '~/composables/file/useFileOperator';
const { newFolder } = useFileOperator();

import useFileData from '~/composables/file/useFileData';
let { popPassword } = useFileData();

const onNewFolder = () => {
  newFolder(selectPath.value).then(() => {
    loadFileList();
  });
};

// 组件传参及回写
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  showDecompressOptions: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: '选择文件夹',
  },
  storageKey: {
    type: String,
    required: true,
  },
  basePath: {
    type: String,
    default: '/',
  },
  onClose: {
    type: Function,
    default: () => {},
  },
});

const loading = inject('loading');

const selectPath = ref('');
const createDir = ref(true);
const password = ref('');
const charset = ref('UTF-8');
const fileList = ref([]);
const breadcrumbData = computed(() => {
  let data = [
    {
      name: '根目录',
      href: '/',
      disable: false,
    },
  ];

  let paths = selectPath.value && selectPath.value.split('/');
  if (paths) {
    // 去除 paths 中所有空白字符
    paths = paths.filter((item) => {
      return !!item;
    });

    paths.forEach((item, index, arr) => {
      let breadcrumbItem = {
        name: item,
        href: concatPath('/', arr.slice(0, index + 1).join('/')),
        disable: index === arr.length - 1,
      };
      data.push(breadcrumbItem);
    });
  }
  return data;
});

onMounted(() => {
  // 初始化路径
  selectPath.value = props.basePath;
  // 加载文件列表
  loadFileList();
});

const listLoading = ref(false);

const loadFileList = async (password, rememberPassword) => {
  const param = {
    storageKey: props.storageKey,
    path: selectPath.value,
    password: password || getPathPwd(selectPath.value, true),
  };
  listLoading.value = true;
  loadFileListReq(param)
    .then((res) => {
      // 过滤所有 type 为 FOLDER 的数据
      res.data.files = res.data.files.filter((item) => {
        return item.type === 'FOLDER';
      });

      let passwordPattern = res.data.passwordPattern;
      putPathPwd(passwordPattern, param.password, rememberPassword);

      fileList.value = res.data.files;
    })
    .catch((error) => {
      const onConfirm = (password, rememberPassword) => {
        loadFileList(password, rememberPassword);
      };
      let data = error.response.data;
      // 如果需要密码或密码错误进行提示, 并弹出输入密码的框.
      if (data.code === constant.responseCode.INVALID_PASSWORD) {
        ElMessage.warning('密码错误，请重新输入！');
        popPassword(onConfirm);
      } else if (data.code === constant.responseCode.REQUIRED_PASSWORD) {
        popPassword(onConfirm);
      } else {
        ElMessage.error(data.msg);
      }
    })
    .finally(() => {
      listLoading.value = false;
    });
};

const onChangePath = (file) => {
  selectPath.value = concatPath(file.path + '/' + file.name);
  loadFileList();
};

const onClickBreadcrumb = (item) => {
  if (item.href) {
    selectPath.value = decodeURI(item.href);
    loadFileList();
  }
};

// 响应关闭事件
const emit = defineEmits(['update:show']);
const handlerClose = (type) => {
  const result = {
    value: selectPath.value,
    type,
    createDir: createDir.value,
    password: password.value,
    charset: charset.value,
  };

  if (type === 'confirm') {
    loading.value = true;
  }

  emit('update:show', false);
  props.onClose(result);
};
</script>

<style lang="scss" scoped>
.zfile-select-folder-body {
  @apply h-full overflow-y-auto;

  :deep(.el-dialog) {
    @apply h-[70vh] w-[calc(100%-20px)] sm:h-96 sm:w-96 sm:mt-[10vh];
  }

  :deep(.el-dialog__body) {
    @apply flex h-[calc(100%-32px)] w-full flex-col justify-between py-0;
  }
  
  .zfile-select-folder-charset {
    @apply my-1;
  }
}

.zfile-select-folder-breadcrumb {
  @apply flex-shrink-0;
}

.zfile-select-folder-footer {
  @apply mb-2 h-fit w-full flex-shrink-0;

  .zfile-select-folder-controls {
    @apply flex justify-between;
  }
}
</style>
