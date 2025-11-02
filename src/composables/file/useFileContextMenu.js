import { nextTick } from 'vue';

import 'v-contextmenu/dist/themes/default.css';

import useFileSelect from '~/composables/file/useFileSelect';
const { selectRows, clearSelection, toggleRowSelection } = useFileSelect();

import useRouterData from '~/composables/useRouterData';
let { storageKey } = useRouterData();

import useFileDataStore from '~/stores/file-data';
let fileDataStore = useFileDataStore();

const contextMenuTargetFile = ref(false);
const contextMenuTargetBlank = ref(false);

let contextmenuRef;

export default function useFileContextMenu() {
  const initContextMenu = (ref) => {
    contextmenuRef = ref.value;
  };

  const showFileMenu = (row, column, event) => {
    if (!storageKey.value) {
      return;
    }

    // 如果右键的不是空白区域，则不显示菜单
    if (row instanceof Event) {
      event = row;
      let parentDom = document.querySelector('.zfile-index-body');
      let ignoreDom = document.querySelector('.el-dialog');
      if (!parentDom.contains(event.target) || ignoreDom?.contains(event.target)) {
        return;
      }
      contextMenuTargetBlank.value = true;
    } else {
      if (row.type === 'BACK') {
        return;
      }
      fileDataStore.updateCurrentRightClickRow(row);

      if (!selectRows.value.includes(row)) {
        clearSelection();
        toggleRowSelection(row, true);
      }
      contextMenuTargetFile.value = true;
    }

    event.preventDefault();
    event.stopPropagation();

    contextmenuRef.show({
      top: event.clientY,
      left: event.clientX,
    });
    nextTick().then(() => {
      setTimeout(() => {
        adjustMenuPosition();
        contextmenuRef.$el.hidden = false;
      }, 100);
    });

    window.onclick = () => {
      contextmenuRef.hide();
      contextMenuTargetBlank.value = false;
      contextMenuTargetFile.value = false;
    };
  };

  const adjustMenuPosition = () => {
    const el = document.querySelector('.v-contextmenu');
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const margin = 5; // 边距

    // 底部超出
    if (rect.bottom > vh - margin) {
      el.style.top = '';
      el.style.bottom = `${margin}px`;
    }
    // 右侧超出
    if (rect.right > vw - margin) {
      el.style.left = '';
      el.style.right = `${margin}px`;
    }
  };

  return {
    initContextMenu,
    showFileMenu,
    contextMenuTargetFile,
    contextMenuTargetBlank,
  };
}
