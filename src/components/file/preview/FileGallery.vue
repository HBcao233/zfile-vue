<template>
  <!-- 画廊模式 -->
  <div class="zfile-gallery-body">
    <div v-if="transferResult.length > 0" class="zfile-img-body">
      <div v-for="(rowItem, index) in transferResult" :key="index" class="zfile-img-row">
        <div
          v-for="colItem in rowItem"
          class="zfile-img-col"
          :style="{
            display:
              globalConfigStore.zfileConfig.gallery.showInfoMode === 'hover' ? 'flex' : 'block',
          }"
          @click="openGalleryImage(colItem)"
        >
          <template v-if="colItem?.url">
            <img
              class="zfile-gallery-img lazyload"
              data-sizes="auto"
              :class="
                globalConfigStore.zfileConfig.gallery.roundedBorder
                  ? 'zfile-gallery-img-rounded'
                  : ''
              "
              :data-src="colItem.url"
              loading="lazy"
              :alt="colItem.name"
              @load="loadImg"
            />
            <div
              v-if="
                globalConfigStore.zfileConfig.gallery.showInfo &&
                globalConfigStore.zfileConfig.gallery.showInfoMode === 'hover'
              "
              v-show="loadedList.includes(colItem.name)"
              :class="
                globalConfigStore.zfileConfig.gallery.roundedBorder
                  ? 'zfile-gallery-img-rounded'
                  : ''
              "
              class="zfile-gallery-img-hover-info"
            >
              <span class="zfile-gallery-img-text">{{ colItem.name }}</span>
              <span class="zfile-gallery-img-text">{{ fileSizeFormat(colItem.size) }}</span>
            </div>
            <div
              v-show="loadedList.includes(colItem.name)"
              v-if="
                globalConfigStore.zfileConfig.gallery.showInfo &&
                globalConfigStore.zfileConfig.gallery.showInfoMode === 'bottom'
              "
            >
              <span class="zfile-gallery-img-text"> {{ colItem.name }} </span>
            </div>
          </template>
        </div>
      </div>
    </div>
    <div v-else class="h-full">
      <el-empty class="h-full" description="当前文件夹无图片">
        <el-button type="primary" @click="fileDataStore.imgMode = false">退出画廊模式</el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup>
import { fileSizeFormat } from '~/utils';
import { computed, reactive, ref } from 'vue';

import 'lazysizes';
import useGlobalConfigStore from '~/stores/global-config';
let globalConfigStore = useGlobalConfigStore();

import useFileDataStore from '~/stores/file-data';
let fileDataStore = useFileDataStore();

// 计算图片二维列表, 多行 * 多列
const transferResult = computed(() => {
  // 获取图片列表
  let imgList = fileDataStore.filterFileByType('image');

  if (imgList.length === 0) {
    return [];
  }

  // 图片二维数组, 表示每行每列的图片
  let imgArray = ref([]);

  // 图片列数
  let galleryColumn = globalConfigStore.zfileConfig.gallery.column;

  // 当前行数
  let currRow = 0;

  imgList.forEach((item, index) => {
    if (index % galleryColumn === 0) {
      if (index !== 0) {
        currRow++;
      }
      imgArray.value[currRow] = [];
    }
    imgArray.value[currRow].push(item);
  });

  // 图片行转列函数
  function transfer(oldArr) {
    return oldArr[0].map((col, i) => oldArr.map((row) => row[i]));
  }

  // 图片行转列完成后的数组
  return transfer(imgArray.value);
});

// 图片行间距 px
let galleryRowSpacingPx = computed(() => {
  return globalConfigStore.zfileConfig.gallery.rowSpacing + 'px';
});

// 图片列间距 px
let galleryColSpacingPx = computed(() => {
  return `0 ${globalConfigStore.zfileConfig.gallery.columnSpacing / 2}px`;
});

// 图片外部容器宽度, 100 / 图片列数
let galleryRowWidth = computed(() => {
  // 图片列数
  let galleryColumn = globalConfigStore.zfileConfig.gallery.column;
  let galleryColumnSpacing = globalConfigStore.zfileConfig.gallery.columnSpacing;
  return `calc(calc(100% / ${globalConfigStore.zfileConfig.gallery.column}) - calc(${
    (galleryColumn - 1) * galleryColumnSpacing
  }px / ${galleryColumn}))`;
});

// 引入文件预览组件
import useFilePreview from '~/composables/file/useFilePreview';
const { openImage } = useFilePreview();
const openGalleryImage = (item) => {
  if (!globalConfigStore.zfileConfig.imagePreview.gallery) {
    return;
  }
  if (loadedList.includes(item.name)) {
    openImage(item);
  }
};

// 已加载完的图片列表, 已加载完才悬浮显示标题
let loadedList = reactive([]);
const loadImg = (e) => {
  loadedList.push(e.currentTarget.alt);
};
</script>

<style lang="scss" scoped>
.zfile-gallery-body {
  height: 100%;
  margin-top: 10px;

  .zfile-img-body {
    @apply flex h-full flex-wrap;
  }

  .zfile-img-row {
    width: v-bind('galleryRowWidth');
    margin: v-bind('galleryColSpacingPx');

    &:first-child {
      margin-left: 0;
    }

    &:last-child {
      margin-right: 0;
    }
  }

  .zfile-img-col {
    @apply relative flex overflow-hidden text-center;
    margin-bottom: v-bind('galleryRowSpacingPx');

    .zfile-gallery-img {
      @apply border;
    }

    .zfile-gallery-img:not(.loaded) {
      @apply w-full;
    }

    .zfile-gallery-img:not(.lazyloaded) {
      @apply min-h-[150px];
    }

    .zfile-gallery-img-rounded {
      @apply rounded-lg;
    }

    .zfile-gallery-img-text {
      @apply overflow-hidden overflow-ellipsis whitespace-nowrap text-sm opacity-70;
    }

    .zfile-gallery-img-hover-info {
      @apply absolute left-0 right-0 top-0 flex h-1/2 justify-between
			space-x-10 p-2
			text-sm text-white
			opacity-0 transition-opacity duration-300;
      background: linear-gradient(180deg, rgba(0, 0, 0, 0.6), transparent 120px);

      .zfile-gallery-img-text:last-child {
        @apply min-w-fit text-right;
      }
    }

    &:hover .zfile-gallery-img-hover-info {
      @apply opacity-100;
    }
  }
}
</style>
