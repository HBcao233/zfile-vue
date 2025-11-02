<template>
  <div v-if="generateLinkResultDialogVisible" class="zfile-file-download-link-body">
    <el-dialog
      v-model="generateLinkResultDialogVisible"
      :destroy-on-close="true"
      title="直链"
      :class="{
        'zfile-file-download-link-dialog-multiple': selectFiles.length > 1,
        'zfile-file-download-link-dialog-single': selectFiles.length <= 1,
      }"
      draggable
      top="5vh"
      @close="generateLinkResultDialogVisible = false"
    >
      <el-table
        v-if="selectFiles.length > 1"
        v-loading="loading"
        element-loading-text="生成中..."
        class="zfile-download-link-table"
        :max-height="currentPageHeight * 0.7"
        :data="dataList"
        @cell-click="handleCellClick"
      >
        <el-table-column prop="name" show-overflow-tooltip>
          <template #header="scope">
            文件名
            <el-tooltip
              :show-arrow="false"
              :offset="15"
              effect="dark"
              content="批量复制到剪贴板"
              placement="top"
            >
              <i-ic-baseline-content-copy
                class="l-5 inline cursor-pointer"
                @click="batchCopyLinkField('name')"
              />
            </el-tooltip>
          </template>
          <template #default="scope">
            {{ scope.row.name }}
          </template>
        </el-table-column>

        <el-table-column
          v-if="
            storageConfigStore.permission.pathLink &&
            (currentLinkDialogType === 'all' || currentLinkDialogType === 'pathLink')
          "
          prop="pathLink"
          show-overflow-tooltip
        >
          <template #header="scope">
            直链
            <el-tooltip
              :show-arrow="false"
              :offset="15"
              effect="dark"
              content="批量复制到剪贴板"
              placement="top"
            >
              <i-ic-baseline-content-copy
                class="l-5 inline cursor-pointer"
                @click="batchCopyLinkField('pathLink')"
              />
            </el-tooltip>
          </template>
          <template #default="scope">
            {{ scope.row.pathLink }}
          </template>
        </el-table-column>

        <el-table-column
          v-if="
            storageConfigStore.permission.shortLink &&
            (currentLinkDialogType === 'all' || currentLinkDialogType === 'shortLink')
          "
          prop="shortLink"
          show-overflow-tooltip
        >
          <template #header="scope">
            短链
            <el-tooltip
              :show-arrow="false"
              :offset="15"
              effect="dark"
              content="批量复制到剪贴板"
              placement="top"
            >
              <i-ic-baseline-content-copy
                class="l-5 inline cursor-pointer"
                @click="batchCopyLinkField('shortLink')"
              />
            </el-tooltip>
          </template>
          <template #default="scope">
            {{ scope.row.shortLink }}
          </template>
        </el-table-column>
      </el-table>

      <el-row v-if="selectFiles.length === 1 && data" class="md:space-y-6">
        <div class="flex w-full flex-row space-x-10">
          <el-image ref="qrcodeRef" class="w-3/4" :src="data.currentImg" />
          <div class="mt-3 flex flex-col space-y-3.5 overflow-y-auto">
            <div
              class="h-10 w-10 cursor-pointer rounded-md border p-1"
              :class="data.currentImg === data.qrcode.a1 ? 'border-blue-400' : ''"
              @click="data.currentImg = data.qrcode.a1"
            >
              <el-image class="h-full w-full" :src="data.qrcode.a1" />
            </div>
            <div
              class="h-10 w-10 cursor-pointer rounded-md border p-1"
              :class="data.currentImg === data.qrcode.a2 ? 'border-blue-400' : ''"
              @click="data.currentImg = data.qrcode.a2"
            >
              <el-image class="h-full w-full" :src="data.qrcode.a2" />
            </div>
            <div
              class="h-10 w-10 cursor-pointer rounded-md border p-1"
              :class="data.currentImg === data.qrcode.sp1 ? 'border-blue-400' : ''"
              @click="data.currentImg = data.qrcode.sp1"
            >
              <el-image class="h-full w-full" :src="data.qrcode.sp1" />
            </div>
            <div
              class="h-10 w-10 cursor-pointer rounded-md border p-1"
              :class="data.currentImg === data.qrcode.aa1 ? 'border-blue-400' : ''"
              @click="data.currentImg = data.qrcode.aa1"
            >
              <el-image class="h-full w-full" :src="data.qrcode.aa1" />
            </div>
            <div
              class="h-10 w-10 cursor-pointer rounded-md border p-1"
              :class="data.currentImg === data.qrcode.ab2 ? 'border-blue-400' : ''"
              @click="data.currentImg = data.qrcode.ab2"
            >
              <el-image class="h-full w-full" :src="data.qrcode.ab2" />
            </div>
          </div>
        </div>
        <div class="w-full">
          <el-form>
            <el-form-item>
              <el-input v-model="data.name" readonly :prefix-icon="DocumentTextIcon"></el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="data.time" readonly :prefix-icon="CalendarIcon"></el-input>
            </el-form-item>
            <el-form-item>
              <el-input v-model="data.size" readonly :prefix-icon="CircleStackIcon"></el-input>
            </el-form-item>
            <el-form-item
              v-if="
                storageConfigStore.permission.pathLink &&
                (currentLinkDialogType === 'all' || currentLinkDialogType === 'pathLink')
              "
            >
              <el-tooltip
                append-to=".zfile-file-download-link-body"
                popper-class="zfile-link-tips"
                placement="left"
                content="路径直链地址，包含文件完整路径."
              >
                <el-input
                  v-model="data.pathLink"
                  :prefix-icon="LinkIcon"
                  @click="copyText(data.pathLink)"
                >
                </el-input>
              </el-tooltip>
            </el-form-item>
            <el-form-item
              v-if="
                storageConfigStore.permission.shortLink &&
                (currentLinkDialogType === 'all' || currentLinkDialogType === 'shortLink')
              "
            >
              <el-tooltip
                append-to=".zfile-file-download-link-body"
                popper-class="zfile-link-tips"
                placement="left"
                content="缩短版直链地址，便于复制分发."
              >
                <el-input
                  v-model="data.shortLink"
                  :prefix-icon="LinkIcon"
                  @click="copyText(data.shortLink)"
                >
                </el-input>
              </el-tooltip>
            </el-form-item>
          </el-form>
        </div>
      </el-row>

      <template #footer>
        <el-button v-show="selectFiles.length > 1" type="primary" @click="exportExcel"
          >导出</el-button
        >
        <el-button type="info" @click="generateLinkResultDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { currentPageHeight } from '~/utils';
import {
  CalendarIcon,
  CircleStackIcon,
  LinkIcon,
  DocumentTextIcon,
} from '@heroicons/vue/24/outline';

// 组件传参及回写
const props = defineProps({
  rowData: {
    type: Object,
  },
});

import useStorageConfigStore from '~/stores/storage-config';
let storageConfigStore = useStorageConfigStore();

let router = useRouter();
let route = useRoute();

import useFileSelect from '~/composables/file/useFileSelect';
let { selectFiles } = useFileSelect();

import useFileLink from '~/composables/file/useFileLink';
let {
  generateLinkResultDialogVisible,
  loading,
  copyText,
  data,
  dataList,
  generateALlLink,
  currentLinkDialogType,
} = useFileLink();

watch(
  () => generateLinkResultDialogVisible.value,
  (value) => {
    if (value) {
      if (selectFiles.value.length === 0) {
        ElMessage.warning('请至少选择一个文件');
      } else {
        if (!storageConfigStore.permission.link) {
          ElMessage.error('没有权限生成直链或短链');
          return;
        }
        generateALlLink(selectFiles.value);
      }
    } else {
      dataList.value = [];
    }
  }
);

const batchCopyLinkField = (filed) => {
  let links = [];
  let fields = filed.split('.');
  dataList.value.forEach((row) => {
    let value = row;
    fields.forEach((item) => {
      value = value[item];
    });
    links.push(value);
  });
  copyText(links.join('\n'));
};

import FileSaver from 'file-saver';
import { utils, write } from 'xlsx/dist/xlsx.core.min';

const exportExcel = () => {
  let xlsxParam = { raw: true };
  // 设置当前日期
  let time = new Date();
  let year = time.getFullYear();
  let month = time.getMonth() + 1;
  let day = time.getDate();
  let name = year + '' + month + '' + day;
  /* generate workbook object from table */
  //  .excelTable要导出的是哪一个表格   注意这里的 excelTable 是要导出的表格的类名
  let wb = utils.table_to_book(document.querySelector('.zfile-download-link-table'), xlsxParam);

  let colsWidth = [{ wch: 50 }, { wch: 50 }, { wch: 50 }];
  dataList.value.forEach((item) => {
    let col1Length = item.name.length;
    let col2Length = item.pathLink?.length;
    let col3Length = item.shortLink?.length;

    if (col1Length > colsWidth[0].wch) {
      colsWidth[0].wch = col1Length;
    }
    if (col2Length > colsWidth[1].wch) {
      colsWidth[1].wch = col2Length + 20;
    }
    if (col3Length > colsWidth[2].wch) {
      colsWidth[2].wch = col3Length;
    }
  });

  wb.Sheets.Sheet1['!cols'] = colsWidth;

  /* get binary string as output */
  let wbout = write(wb, {
    bookType: 'xlsx',
    bookSST: true,
    type: 'array',
  });
  try {
    //  name+'.xlsx'表示导出的excel表格名字
    FileSaver.saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      name + 'ZFile 直链导出.xlsx'
    );
  } catch (e) {
    if (typeof console !== 'undefined') {
      ElMessage.error(e + wbout);
    }
  }
  return wbout;
};

const handleCellClick = (row, column, cell, event) => {
  copyText(row[column.property]);
};
</script>

<style scoped lang="scss">
.zfile-file-download-link-body {
  :deep(.zfile-file-download-link-dialog-single) {
    @apply w-10/12 md:w-96;

    .el-form-item {
      margin-bottom: 8px;
    }
  }

  :deep(.zfile-file-download-link-dialog-multiple) {
    @apply w-10/12;
  }

  :deep(.zfile-link-tips) {
    @apply hidden md:block;
  }
}
</style>
