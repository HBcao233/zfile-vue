import { createApp } from 'vue';
import CompressBox from './CompressBox.vue';
import { ConfirmResult } from './types';

const createDialog = (title: string, inputValue: string, onConfirm: Function) => {
  const mountNode = document.createElement('div');
  const Instance = createApp(CompressBox, {
    show: true,
    title,
    inputValue,
    onClose: (res: ConfirmResult) => {
      const stopLoading = () => {
        loading.value = false;
      };

      const closeDialog = () => {
        Instance.unmount();
        document.body.removeChild(mountNode);
      };

      if (res.type === 'confirm') {
        onConfirm({
          ...res,
          callback: {
            stopLoading,
            closeDialog,
          },
        });
      } else {
        closeDialog();
      }
    },
  });

  // 通过 inject 方法获取 loading 的值
  const loading = ref(false);
  Instance.provide('loading', loading);

  document.body.appendChild(mountNode);
  Instance.mount(mountNode);
};

export default createDialog;
