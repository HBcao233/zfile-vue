<template>
  <div class="flex h-full min-h-screen items-center justify-center bg-gray-100 text-gray-900">
    <div class="flex h-full max-w-screen-lg flex-1 bg-white shadow-xl sm:rounded-xl lg:h-auto">
      <div class="hidden flex-1 rounded-l-xl bg-gray-50 text-center lg:flex">
        <div class="zfile-install-logo m-12 w-full bg-contain bg-center bg-no-repeat xl:m-16" />
      </div>
      <div class="mt-10 w-full p-6 sm:p-12 lg:w-1/2 xl:w-1/2">
        <div class="mt-0 flex flex-col items-center">
          <a
            href="https://github.com/zfile-dev/zfile"
            target="_blank"
            class="box animate__animated animate__fadeInDown mt-0 text-2xl font-extrabold xl:text-3xl"
          >
            <img class="w-16 cursor-pointer" src="../../assets/icons/zfile-basic.svg" />
          </a>
          <div class="w-full flex-1">
            <div class="relative my-12">
              <div class="absolute inset-0 flex items-center" aria-hidden="true">
                <div class="w-full border-t text-gray-600" />
              </div>
              <div class="relative flex justify-center text-sm">
                <span
                  class="bg-white px-2 text-sm font-medium leading-none tracking-wide text-gray-600"
                >
                  系统初始化
                </span>
              </div>
            </div>
            <el-form
              ref="installFormRef"
              :rules="formRules"
              :model="formData"
              class="zfile-install-form"
              size="large"
              @submit.prevent
            >
              <el-form-item class="box animate__animated animate__fadeInUp" prop="siteName">
                <el-input
                  v-model="formData.siteName"
                  tabindex="1"
                  placeholder="站点名称"
                  :prefix-icon="DocumentTextIcon"
                >
                  <template #suffix>
                    <el-popover placement="left" width="300" trigger="hover">
                      <template #default> 这里填写站点名称，会显示在网站标题上 </template>
                      <template #reference>
                        <QuestionMarkCircleIcon class="-mt-0.5 ml-1 inline w-4" />
                      </template>
                    </el-popover>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item class="box animate__animated animate__fadeInUp" prop="username">
                <el-input
                  v-model.trim="formData.username"
                  tabindex="2"
                  placeholder="管理员账号"
                  :prefix-icon="UserIcon"
                >
                  <template #suffix>
                    <el-popover placement="left" width="300" trigger="hover">
                      <template #default> 这里填写初始化管理员账号, 一会用来登录后台 </template>
                      <template #reference>
                        <QuestionMarkCircleIcon class="-mt-0.5 ml-1 inline w-4" />
                      </template>
                    </el-popover>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item class="box animate__animated animate__fadeInUp" prop="password">
                <el-input
                  v-model.trim="formData.password"
                  tabindex="3"
                  placeholder="管理员密码"
                  type="password"
                  show-password
                  :prefix-icon="KeyIcon"
                >
                  <template #suffix>
                    <el-popover placement="left" width="300" trigger="hover">
                      <template #default> 这里填写初始化管理员密码, 一会用来登录后台 </template>
                      <template #reference>
                        <QuestionMarkCircleIcon class="-mt-0.5 ml-1 inline w-4" />
                      </template>
                    </el-popover>
                  </template>
                </el-input>
              </el-form-item>

              <el-form-item>
                <el-button
                  tabindex="4"
                  native-type="submit"
                  :loading="loading"
                  class="w-full"
                  type="primary"
                  :icon="CheckBadgeIcon"
                  @click="submitForm"
                >
                  系统初始化
                </el-button>
              </el-form-item>
            </el-form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { installReq, installStatusReq } from '~/api/home/install';
import { CheckBadgeIcon, KeyIcon, DocumentTextIcon, UserIcon } from '@heroicons/vue/24/outline';
import { QuestionMarkCircleIcon } from '@heroicons/vue/24/solid';
import MessageBox from '~/components/messageBox/messageBox';
import { ElMessage } from 'element-plus';

let router = useRouter();

let formData = reactive({
  siteName: '',
  username: '',
  password: '',
});

let formRules = ref({
  siteName: [{ required: true, message: '请输入站点名称', trigger: ['change', 'blur'] }],
  username: [
    {
      required: true,
      message: '请输入管理员账号',
      trigger: ['change', 'blur'],
    },
  ],
  password: [
    {
      required: true,
      message: '请输入管理员密码',
      trigger: ['change', 'blur'],
    },
  ],
});

let loading = ref(false);
let installFormRef = ref();
const submitForm = async () => {
  await installFormRef.value.validate((checked) => {
    if (checked) {
      loading.value = true;
      installReq(formData)
        .then(() => {
          MessageBox.confirm('系统初始化成功, 点击确定跳转到登录页面。', '提示', {
            confirmButtonText: '确定',
            showCancelButton: false,
            showCloseButton: false,
            closeOnClickModal: false,
            closeOnPressEscape: false,
            type: 'success',
          }).then(() => {
            router.push('/login');
          });
        })
        .finally(() => {
          loading.value = false;
        });
    } else {
      ElMessage.warning('请正确输入初始化值!');
    }
  });
};

onBeforeMount(() => {
  installStatusReq().then((response) => {
    if (response.data) {
      router.push('/');
    }
  });
});
</script>

<style lang="scss" scoped>
.zfile-install-logo {
  background-image: url('~/assets/icons/install-step.svg');
}

.zfile-install-form {
  --zfile-install-input-height: 45px;

  :deep(.el-input__inner) {
    height: var(--zfile-install-input-height);
  }

  :deep(.el-button--large) {
    --el-button-size: var(--zfile-install-input-height);
    height: var(--el-button-size);
  }

  // 防止谷歌浏览器记住密码后样式错乱
  :deep(input:-internal-autofill-selected) {
    -webkit-text-fill-color: var(--el-input-text-color, var(--el-text-color-regular));
    transition: background-color 1000s ease-out 0.5s;
  }
}
</style>
