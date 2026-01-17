<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard title="视频管理" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
      <template #header-extra>
        <div class="text-gray-500 text-sm">
          共 {{ total }} 条
        </div>
      </template>
      <!-- 搜索区域 -->
      <NForm :model="searchParams" label-placement="left" :label-width="80">
        <NGrid cols="1 s:2 m:3 l:5" responsive="screen" :x-gap="16" :y-gap="8">
          <NFormItemGi label="用户名">
            <NInput v-model:value="searchParams.username" placeholder="请输入用户名" clearable />
          </NFormItemGi>
          <NFormItemGi label="状态">
            <NSelect
              v-model:value="searchParams.status"
              :options="statusOptions"
              placeholder="请选择状态"
              clearable
            />
          </NFormItemGi>
          <NFormItemGi label="创建时间">
            <NDatePicker
              v-model:value="dateRange"
              type="daterange"
              clearable
              @update:value="handleDateRangeChange"
            />
          </NFormItemGi>
          <NFormItemGi>
            <NSpace>
              <NButton type="primary" size="small" @click="handleSearch">
                <template #icon>
                  <icon-ic-round-search class="text-icon" />
                </template>
                搜索
              </NButton>
              <NButton size="small" @click="handleReset">
                <template #icon>
                  <icon-ic-round-refresh class="text-icon" />
                </template>
                重置
              </NButton>
            </NSpace>
          </NFormItemGi>
        </NGrid>
      </NForm>

      <!-- 表格区域 -->
      <div class="table-container">
        <NDataTable
          :columns="columns"
          :data="videoHistory"
          :loading="loading"
          :pagination="{
            page: currentPage,
            pageSize: pageSize,
            pageCount: Math.ceil(total / pageSize),
            itemCount: total,
            showSizePicker: true,
            pageSizes: [10, 20, 50, 100]
          }"
          :max-height="530"
          remote
          @update:page="handleChangePage"
          @update:page-size="handlePageSizeChange"
        />
      </div>
    </NCard>
  </div>
</template>


<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue';
import type { DataTableColumns } from 'naive-ui';
import { NButton, NCard, NDataTable, NForm, NFormItemGi, NGrid, NInput, NSelect, NTag, NSpace, useDialog, useMessage } from 'naive-ui';
import { fetchVideoHistory, deleteVideoRecord } from '@/service/api';
import { formatDate } from '@/utils/date';

// 视频历史记录
const videoHistory = ref<Api.Video.VideoRecord[]>([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 查询参数
const searchParams = reactive<Api.Video.VideoHistoryParams>({
  current: 1,
  size: 10,
  username: '',
  status: undefined,
  startDate: '',
  endDate: ''
});

// 日期范围
const dateRange = ref<[number, number] | null>(null);

// 状态选项
const statusOptions = [
  { label: '全部', value: undefined },
  { label: '成功', value: 'success' },
  { label: '处理中', value: 'processing' },
  { label: '失败', value: 'failed' }
];

const handleChangePage = (page: number) => {
  currentPage.value = page;
  searchParams.current = page;
  getVideoHistory();
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  searchParams.size = size;
  searchParams.current = 1;
  currentPage.value = 1;
  getVideoHistory();
}

const columns: DataTableColumns<Api.Video.VideoRecord> = [
  {
    type: 'selection',
    align: 'center',
    width: 48
  },
  {
    title: '用户名',
    key: 'username',
    width: 100,
    align: 'center'
  },
  {
    title: '昵称',
    key: 'nickname',
    width: 100,
    align: 'center'
  },
  {
    title: '状态',
    key: 'status',
    width: 80,
    align: 'center',
    render(row) {
      if (row.status === 'success') {
        return h(NTag, { type: 'success' }, { default: () => '成功' });
      }
      if (row.status === 'processing') {
        return h(NTag, { type: 'warning' }, { default: () => '处理中' });
      }
      if (row.status === 'failed') {
        return h(NTag, { type: 'error' }, { default: () => '失败' });
      }
      return h(NTag, { type: 'default' }, { default: () => row.status });
    }
  },
  {
    title: 'Prompt',
    key: 'prompt',
    width: 300,
    align: 'center',
    render(row) {
      if (row.requestParams && row.requestParams.prompt) {
        const prompt = row.requestParams.prompt;
        // 如果prompt太长，截取前20个字符并添加省略号
        const truncatedPrompt = prompt.length > 20 ? prompt.substring(0, 20) + '...' : prompt;
        return h('div', { title: prompt }, truncatedPrompt);
      }
      return '-';
    }
  },
  {
    title: '请求参数',
    key: 'requestParams',
    width: 60,
    align: 'center',
    render(row) {
      return h(
      "div",
        {
          style: 'display: flex; align-items: center; justify-content: center; gap: 8px;color:rgb(100, 108, 255);', 
          onClick: () => handleViewRequestParams(row)
        },
        { default: () => '查看' }
      );
    }
  },
  {
    title: '请求结果',
    key: 'responseResult',
    width: 60,
    align: 'center',
    render(row) {
      return h(
        "div",
        {
          style: 'display: flex; align-items: center; justify-content: center; gap: 8px;color:rgb(100, 108, 255);', 
          onClick: () => handleViewResponseResult(row)
        },
        { default: () => '查看' }
      );
    }
  },
  {
    title: '实际时长',
    key: 'actualDuration',
    width: 80,
    align: 'center',
    render(row) {
      // 尝试从responseResult中获取实际视频时长
      if (row.responseResult && row.responseResult.data) {
        const response = row.responseResult.data;
        
        // 计算实际视频时长（结束时间 - 开始时间）
        if (response.end_time && response.start_time) {
          const actualDuration = Math.floor((response.end_time - response.start_time) / 60); // 转换为分钟
          
          // 如果时长小于1分钟，显示秒数
          if (actualDuration === 0) {
            const seconds = response.end_time - response.start_time;
            return `${seconds}秒`;
          }
          
          return `${actualDuration}分钟`;
        }
      }
      
      return '-';
    }
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 150,
    render(row) {
      return formatDate(row.createdAt);
    },
    align: 'center'
  },
  {
    title: '操作',
    key: 'operate',
    width: 130,
    align: 'center',
    render: (row) => {
      return h(
        NSpace,
        { size: 8 },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                type: 'primary',
                ghost: true,
                onClick: () => handleView(row)
              },
              { default: () => '查看' }
            ),
            h(
              NButton,
              {
                size: 'small',
                type: 'error',
                ghost: true,
                onClick: () => handleDelete(row)
              },
              { default: () => '删除' }
            )
          ]
        }
      );
    }
  }
];

function handleViewRequestParams(row: any) {
  dialog.info({
    title: '请求参数',
    content: () => {
      const params = row.requestParams || {};
      const paramsJson = JSON.stringify(params, null, 2);
      return h('pre', { style: 'white-space: pre-wrap; word-break: break-all; max-height: 400px; overflow-y: auto;' }, paramsJson);
    },
    positiveText: '确定',
    style: { width: '600px' }
  });
}

// 查看请求结果
function handleViewResponseResult(row: any) {
  dialog.info({
    title: '请求结果',
    content: () => {
      const result = row.responseResult || {};
      const resultJson = JSON.stringify(result, null, 2);
      return h('pre', { style: 'white-space: pre-wrap; word-break: break-all; max-height: 400px; overflow-y: auto;' }, resultJson);
    },
    positiveText: '确定',
    style: { width: '600px' }
  });
}
const dialog = useDialog();
const message = useMessage();

// 获取视频历史记录
async function getVideoHistory() {
  try {
    loading.value = true;
    const res = await fetchVideoHistory(searchParams);
    const data: any = res.data || {};
    videoHistory.value = data.records || [];
    total.value = data.total || 0;
  } catch (error) {
    console.error('获取视频历史失败:', error);
    window.$message?.error('获取视频历史失败');
  } finally {
    loading.value = false;
  }
}

// 搜索
function handleSearch() {
  currentPage.value = 1;
  searchParams.current = 1;
  getVideoHistory();
}

// 重置
function handleReset() {
  searchParams.username = '';
  searchParams.status = undefined;
  searchParams.startDate = '';
  searchParams.endDate = '';
  dateRange.value = null;
  currentPage.value = 1;
  searchParams.current = 1;
  getVideoHistory();
}

// 日期范围变化处理
function handleDateRangeChange(value: [number, number] | null) {
  if (value) {
    const startDate = new Date(value[0]);
    const endDate = new Date(value[1]);
    searchParams.startDate = formatDate(startDate);
    searchParams.endDate = formatDate(endDate);
  } else {
    searchParams.startDate = '';
    searchParams.endDate = '';
  }
}

// 查看详情
function handleView(row: any) {
  // 这里可以实现查看详情的逻辑，例如打开一个详情弹窗
  message.info(`查看视频记录详情: ${row.videoTitle}`);
}

// 删除记录
function handleDelete(row: any) {
  dialog.warning({
    title: '警告',
    content: `确定要删除视频记录 "${row.videoTitle}" 吗？`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await deleteVideoRecord(row.id);
        message.success('删除成功');
        getVideoHistory();
      } catch (error) {
        message.error('删除失败');
      }
    }
  });
}

// 页面加载时获取数据
onMounted(() => {
  getVideoHistory();
});
</script>
<style scoped>
.card-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-container {
  flex: 1;
  overflow: hidden;
}
</style>