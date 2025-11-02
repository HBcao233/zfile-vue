<template>
  <div v-loading="loading">
    <admin-form-header title="存储源信息">
      <template #subTitle>
        <div class="flex flex-wrap items-center justify-between">
          <div>
            此页可以维护您的存储源信息，可以拖动交换存储源之间的顺序. 配置示例可参考：
            <a
              class="link"
              target="_blank"
              href="https://docs.zfile.vip/category/%E5%AD%98%E5%82%A8%E6%BA%90%E7%A4%BA%E4%BE%8B%E9%85%8D%E7%BD%AE"
              >ZFile 存储源配置文档</a
            >
          </div>
          <div>
            <el-input
              v-model="searchKey"
              placeholder="请输入搜索内容"
              :prefix-icon="MagnifyingGlassIcon"
            ></el-input>
          </div>
        </div>
      </template>
    </admin-form-header>

    <ul
      role="list"
      class="storage-container grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5"
    >
      <li
        v-for="storage in storageListSearchResult"
        :key="storage.id"
        class="storage-item group col-span-1 flex flex-col rounded-lg border bg-white text-center hover:shadow"
        @dblclick="editStorage(storage)"
      >
        <div class="relative flex flex-1 flex-col p-8 pb-4">
          <i-material-symbols-open-in-new
            class="absolute left-3 top-3 cursor-pointer text-sm text-blue-500 opacity-0 group-hover:opacity-100"
            @click="openStorage(storage.key)"
          />
          <i-solar-trash-bin-minimalistic-bold
            name="delete"
            class="absolute right-3 top-3 cursor-pointer group-hover:text-red-500"
            @click="deleteStorage(storage)"
          />

          <div class="mx-auto w-fit rounded-full bg-blue-50">
            <img class="mx-auto h-20 w-20 flex-shrink-0 p-4" :src="getImg(storage.type.key)" />
          </div>
          <h3 class="mt-2 text-sm font-medium text-gray-900">
            {{ storage.name }}
          </h3>
          <dl class="mt-1 flex flex-grow flex-col justify-between">
            <dd class="line-clamp-1 text-sm text-gray-500">
              {{ storage.remark }}
            </dd>
            <dd class="mt-2 space-x-1">
              <el-tag type="primary">{{ storage.type.description }}</el-tag>
              <el-tag v-show="storage.enable" type="success" @click="switchEnableStatus(storage)"
                >启用</el-tag
              >
              <el-tag v-show="!storage.enable" type="danger" @click="switchEnableStatus(storage)"
                >停用</el-tag
              >
              <el-tag v-show="storage.enableCache" type="success">缓存</el-tag>

              <el-popover placement="top" :width="250" trigger="hover">
                <div>
                  <div class="text-sm font-medium">
                    <i-clarity-success-standard-solid class="inline text-green-500" />
                    刷新令牌成功
                  </div>
                  <div class="text-xs text-gray-500">
                    上次刷新时间:
                    {{ storage?.refreshTokenInfo?.lastRefreshTime }}
                  </div>
                  <div class="text-xs text-gray-500">
                    令牌到期时间:
                    {{ storage?.refreshTokenInfo?.data?.expiredAtDate }}
                  </div>
                </div>
                <template #reference>
                  <el-tag v-show="storage?.refreshTokenInfo?.success" type="success"
                    >刷新令牌成功</el-tag
                  >
                </template>
              </el-popover>
              <el-popover placement="top" :width="250" trigger="hover">
                <div>
                  <div class="text-sm font-medium">
                    <i-clarity-error-standard-solid class="inline text-red-500" />
                    刷新令牌失败
                  </div>
                  <div class="text-xs text-gray-500">
                    上次刷新时间:
                    {{ storage?.refreshTokenInfo?.lastRefreshTime }}
                  </div>
                  <div class="text-xs text-red-500">
                    失败信息: {{ storage?.refreshTokenInfo?.msg }}
                  </div>
                </div>
                <template #reference>
                  <el-tag v-show="storage?.refreshTokenInfo?.success === false" type="danger"
                    >刷新令牌失败</el-tag
                  >
                </template>
              </el-popover>
            </dd>
          </dl>
        </div>
        <div class="-mt-px flex divide-x divide-gray-200 border-t">
          <div class="flex w-0 flex-1 cursor-pointer" @click="editStorage(storage)">
            <span
              class="relative -mr-px ml-3 inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              <i-mdi-rename-outline class="mr-2" />
              <span>编辑</span>
            </span>
          </div>
          <el-dropdown class="flex-1 cursor-pointer" @command="handleOperator">
            <div class="flex w-0 flex-1 cursor-pointer">
              <span
                class="relative -mr-px ml-3 inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                <span class="text-sm font-medium">
                  <i-material-symbols-more-horiz class="mr-2 inline" />
                  <span>更多</span>
                </span>
              </span>
            </div>

            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :icon="PencilIcon" :command="{ operator: 'edit', storage }"
                  >编辑</el-dropdown-item
                >
                <el-dropdown-item
                  v-if="!storage.enable"
                  :icon="PlayCircleIcon"
                  :command="{ operator: 'enable', storage }"
                  >启用</el-dropdown-item
                >
                <el-dropdown-item
                  v-else
                  :icon="PauseCircleIcon"
                  :command="{ operator: 'enable', storage }"
                  >停用</el-dropdown-item
                >
                <div class="divider"></div>
                <el-dropdown-item
                  :icon="LockOpenIcon"
                  :command="{ operator: 'permissionManager', storage }"
                >
                  <span class="line-through">权限管理</span>
                </el-dropdown-item>
                <div class="divider"></div>
                <!--<el-dropdown-item :icon="Operation" :command="{operator: 'cacheManager', storage}">缓存管理</el-dropdown-item>-->
                <el-dropdown-item
                  :icon="DocumentTextIcon"
                  :command="{ operator: 'readmeManager', storage }"
                  >目录文档</el-dropdown-item
                >
                <el-dropdown-item
                  :icon="EyeSlashIcon"
                  :command="{ operator: 'filterManager', storage }"
                  >文件过滤</el-dropdown-item
                >
                <el-dropdown-item :icon="KeyIcon" :command="{ operator: 'pwdManager', storage }"
                  >密码设置</el-dropdown-item
                >
                <div class="divider"></div>
                <el-dropdown-item
                  :icon="ClipboardDocumentIcon"
                  :command="{ operator: 'copy', storage }"
                  >复制存储源</el-dropdown-item
                >
                <div class="divider"></div>
                <el-dropdown-item :icon="TrashIcon" :command="{ operator: 'delete', storage }"
                  >删除</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </li>
      <li
        class="add-storage-btn col-span-1 flex cursor-pointer flex-col rounded-lg border bg-white text-center hover:shadow"
        @click="addStorage"
      >
        <div class="mx-auto flex flex-1 flex-col justify-center p-8">
          <PlusIcon class="h-20 text-gray-300" />
        </div>
      </li>
    </ul>
  </div>
  <storage-copy @close="init"></storage-copy>
</template>

<script setup>
import {
  PencilIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  KeyIcon,
  LockOpenIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  EyeSlashIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  PlusIcon,
} from '@heroicons/vue/24/outline';
import StorageCopy from '~/pages/admin/storage-copy/index.vue';

let router = useRouter();
import useStorageList from '~/composables/admin/storage/storage-list';
const {
  init,
  loading,
  searchKey,
  storageListSearchResult,
  handleOperator,
  editStorage,
  addStorage,
  deleteStorage,
  switchEnableStatus,
} = useStorageList(router);

onMounted(() => {
  init();
});

const openStorage = (key) => {
  window.open(`/${key}`);
};

const getImg = (name) => {
  const path = `/src/assets/icons/storage-${name}.svg`;
  const modules = import.meta.glob('/src/assets/icons/*', { eager: true });
  if (modules[path]) {
    return modules[path].default;
  }
};
</script>

<style scoped>
.storage-container li {
  @apply h-72;
}
</style>

<route lang="yaml">
meta:
  layout: admin
  name: 存储源管理
</route>
