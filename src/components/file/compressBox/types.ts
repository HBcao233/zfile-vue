// 声明返回值类型
export interface ConfirmResult {
  type: 'cancel' | 'close' | 'confirm';
  compressName: String;
  compressType: String;
  splitSizeMB: Number;
}
