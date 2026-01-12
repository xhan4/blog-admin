<script setup lang="ts">
import { computed, reactive, ref, onMounted, h } from 'vue';
import { useAppStore } from '@/store/modules/app';
import { fetchUserList, fetchUserDetail } from '@/service/api/user';
import { NAvatar, NButton, NTag, NText, NFormItem, NModal, NCard, NSpin, NGrid, NGi } from 'naive-ui';

const appStore = useAppStore();
const gap = computed(() => (appStore.isMobile ? 0 : 16));

// 表格数据
const loading = ref(false);
const data = reactive<any>({
  list: [] as Api.User.UserInfo[],
  total: 0
});
const pagination = reactive({
  page: 1,
  pageSize: 10,
  pageCount: 0
});

// 搜索参数
const searchParams = reactive({
  username: '',
  nickname: '',
  active: undefined as number | undefined,
  membership: undefined as string | undefined
});

// 详情对话框
const detailVisible = ref(false);
const detailUser = ref<Api.User.UserInfo | null>(null);
const detailLoading = ref(false);

// 选项配置 - 根据实际API数据更新
const roleOptions = [
  { label: '普通用户', value: '0' },
  { label: '管理员', value: '1' },
  { label: '超级管理员', value: '2' }
];

const membershipOptions = [
  { label: '普通用户', value: '0' },
  { label: '普通会员', value: '1' },
  { label: '高级会员', value: '2' },
  { label: '终身会员', value: '3' }
];

const activeOptions = [
  { label: '激活', value: 1 },
  { label: '禁用', value: 0 }
];

// 表格列定义
const columns = ref([
  {
    title: 'ID',
    key: 'id',
    width: 80
  },
  {
    title: '用户名',
    key: 'username',
    width: 120
  },
  {
    title: '昵称',
    key: 'nickname',
    width: 120
  },
  {
    title: '头像',
    key: 'avatar',
    width: 80,
    render: (row: Api.User.UserInfo) => {
      return h(NAvatar, {
        size: 'small',
        src: row.avatar || 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg',
        fallbackSrc: 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'
      });
    }
  },
  {
    title: '角色',
    key: 'roles',
    width: 120,
    render: (row: Api.User.UserInfo) => {
      return h(
        'div',
        { style: 'display: flex; flex-wrap: wrap; gap: 4px;' },
        row.roles.map((role: string) => {
          const option = roleOptions.find(opt => opt.value === role);
          return h(
            NTag,
            {
              key: role,
              type:role === '1' ? 'warning' : 'default'
            },
            { default: () => option ? option.label : role }
          );
        })
      );
    }
  },
  {
    title: '会员等级',
    key: 'membership',
    width: 100,
    render: (row: Api.User.UserInfo) => {
      const option = membershipOptions.find(opt => opt.value === row.membership);
      return option ? option.label : row.membership;
    }
  },
  {
    title: '积分',
    key: 'points',
    width: 80
  },
  {
    title: '状态',
    key: 'active',
    width: 80,
    render: (row: Api.User.UserInfo) => {
      const option = activeOptions.find(opt => opt.value === (row.active || 0));
      return h(
        NTag,
        {
          type: (row.active || 0) === 1 ? 'success' : 'error'
        },
        { default: () => option ? option.label : (row.active || 0) }
      );
    }
  },
  {
    title: '创建时间',
    key: 'create_time',
    width: 160,
    render: (row: Api.User.UserInfo) => formatDate(row.create_time)
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (row: Api.User.UserInfo) => {
      return h(
        NButton,
        {
          size: 'small',
          type: 'primary',
          onClick: () => handleViewDetail(row.id)
        },
        { default: () => '查看详情' }
      );
    }
  }
]);

// 格式化日期
function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString('zh-CN');
}

// 获取用户列表
async function getData() {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      pageSize: pagination.pageSize,
      ...searchParams
    };
    
    const result:any = await fetchUserList(params);
    // 根据实际API响应格式修正数据赋值
    data.list = result.data || [];
    data.total = result.data?.length || 0;
    pagination.pageCount = Math.ceil((result.data?.length || 0) / pagination.pageSize);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    window.$message?.error('获取用户列表失败');
  } finally {
    loading.value = false;
  }
}

// 查看用户详情
async function handleViewDetail(id: number) {
  detailLoading.value = true;
  try {
    const result:any = await fetchUserDetail(id);
    detailUser.value = result.data || null;
    detailVisible.value = true;
  } catch (error) {
    console.error('获取用户详情失败:', error);
    window.$message?.error('获取用户详情失败');
  } finally {
    detailLoading.value = false;
  }
}

// 搜索
function handleSearch() {
  pagination.page = 1;
  getData();
}

// 重置搜索
function handleReset() {
  Object.assign(searchParams, {
    username: '',
    nickname: '',
    active: undefined,
    membership: undefined
  });
  pagination.page = 1;
  getData();
}

// 分页变化
function handlePageChange(page: number) {
  pagination.page = page;
  getData();
}

// 分页大小变化
function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize;
  pagination.page = 1;
  getData();
}

onMounted(() => {
  getData();
});
</script>

<template>
  <div class="p-4">
    <NCard title="用户管理" :bordered="false">
      <template #header-extra>
        <div class="text-gray-500 text-sm">
          共 {{ data.total }} 个用户
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="mb-4">
        <NGrid :x-gap="gap" :y-gap="16" responsive="screen" item-responsive>
          <NGi span="24 s:12 m:3">
            <NFormItem label="">
              <NInput v-model:value="searchParams.username" placeholder="请输入用户名" clearable />
            </NFormItem>
          </NGi>
          <NGi span="24 s:12 m:3">
            <NFormItem label="">
              <NInput v-model:value="searchParams.nickname" placeholder="请输入昵称" clearable />
            </NFormItem>
          </NGi>
          <NGi span="24 s:12 m:3">
            <NFormItem label="">
              <NSelect 
                v-model:value="searchParams.active" 
                :options="activeOptions" 
                placeholder="请选择状态" 
                clearable 
              />
            </NFormItem>
          </NGi>
          <NGi span="24 s:12 m:3">
            <NFormItem label="">
              <NSelect 
                v-model:value="searchParams.membership" 
                :options="membershipOptions" 
                placeholder="请选择等级" 
                clearable 
              />
            </NFormItem>
          </NGi>
          <NGi span="24 s:12 m:2">
            <div class="flex items-center h-full gap-2">
              <NButton @click="handleReset" size="medium">重置</NButton>
              <NButton type="primary" @click="handleSearch" size="medium">搜索</NButton>
            </div>
          </NGi>
        </NGrid>
      </div>

      <!-- 表格 -->
      <NDataTable
        :loading="loading"
        :columns="columns"
        :data="data.list"
        :pagination="{
          page: pagination.page,
          pageSize: pagination.pageSize,
          pageCount: pagination.pageCount,
          itemCount: data.total,
          showSizePicker: true,
          pageSizes: [10, 20, 50, 100]
        }"
        remote
        @update:page="handlePageChange"
        @update:page-size="handlePageSizeChange"
      />
    </NCard>

    <!-- 用户详情对话框 -->
    <NModal v-model:show="detailVisible" :mask-closable="false" style="width: 600px">
      <NCard
        title="用户详情"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <NButton
            quaternary
            circle
            @click="detailVisible = false"
            style="margin-right: -8px;"
          >
            <template #icon>
              <div style="font-size: 18px; line-height: 1;">×</div>
            </template>
          </NButton>
        </template>
        
        <NSpin :show="detailLoading">
          <NGrid v-if="detailUser" :x-gap="24" :y-gap="16" responsive="screen" item-responsive>
            <NGi span="24">
              <div class="flex items-center gap-4 mb-4">
                <NAvatar
                  :src="detailUser.avatar || 'https://07akioni.oss-cn-beijing.aliyuncs.com/07akioni.jpeg'"
                  size="large"
                />
                <div>
                  <div class="text-lg font-semibold">{{ detailUser.nickname }}</div>
                  <div class="text-gray-500">@{{ detailUser.username }}</div>
                </div>
              </div>
            </NGi>
            
            <NGi span="12">
              <NFormItem label="用户ID">
                <NText>{{ detailUser.id }}</NText>
              </NFormItem>
            </NGi>
            <NGi span="12">
              <NFormItem label="应用ID">
                <NText>{{ detailUser.appId || '无' }}</NText>
              </NFormItem>
            </NGi>
            
            <NGi span="12">
              <NFormItem label="角色">
                <NTag 
                  v-for="role in detailUser.roles" 
                  :key="role"
                  :type="role === '1' ? 'warning' : 'default'"
                >
                  {{ roleOptions.find(opt => opt.value === role)?.label || role }}
                </NTag>
              </NFormItem>
            </NGi>
            <NGi span="12">
              <NFormItem label="会员等级">
                <NTag :type="detailUser.membership === '3' ? 'success' : 'primary'">
                  {{ membershipOptions.find(opt => opt.value === detailUser?.membership)?.label || detailUser.membership }}
                </NTag>
              </NFormItem>
            </NGi>
            
            <NGi span="12">
              <NFormItem label="积分">
                <NText>{{ detailUser.points }}</NText>
              </NFormItem>
            </NGi>
            <NGi span="12">
              <NFormItem label="状态">
                <NTag :type="(detailUser.active || 0) == 1 ? 'success' : 'error'">
                  {{ (detailUser.active || 0) == 1 ? '激活' : '禁用' }}
                </NTag>
              </NFormItem>
            </NGi>
            
            <NGi span="12">
              <NFormItem label="创建时间">
                <NText>{{ formatDate(detailUser.create_time) }}</NText>
              </NFormItem>
            </NGi>
            <NGi span="12">
              <NFormItem label="更新时间">
                <NText>{{ formatDate(detailUser.update_time) }}</NText>
              </NFormItem>
            </NGi>
          </NGrid>
          
          <template #footer>
            <div class="flex justify-end">
              <NButton @click="detailVisible = false">关闭</NButton>
            </div>
          </template>
        </NSpin>
      </NCard>
    </NModal>
  </div>
</template>

<style scoped>
.card-wrapper {
  min-height: 400px;
}
</style>