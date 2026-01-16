<template>
  <div class="min-h-500px flex-col-stretch gap-16px overflow-hidden lt-sm:overflow-auto">
    <NCard title="积分管理" :bordered="false" size="small" class="sm:flex-1-hidden card-wrapper">
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
          <NFormItemGi label="交易类型">
            <NSelect v-model:value="searchParams.transactionType" placeholder="请选择交易类型" clearable
              :options="transactionTypeOptions" />
          </NFormItemGi>
          <NFormItemGi label="日期范围">
            <NDatePicker v-model:value="dateRange" type="daterange" clearable @update:value="handleDateRangeChange" />
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
              <NSpace>
                <NButton type="primary" size="small" @click="handleAddPoints">
                  <template #icon>
                    <icon-ic-round-plus class="text-icon" />
                  </template>
                  调整积分
                </NButton>
              </NSpace>
            </NSpace>
          </NFormItemGi>
        </NGrid>
      </NForm>

      <!-- 表格区域 -->
      <NDataTable :columns="columns" :data="pointsHistory" :loading="loading" :pagination="{
        page: currentPage,
        pageSize: pageSize,
        pageCount: Math.ceil(total / pageSize),
        itemCount: total,
        showSizePicker: true,
        pageSizes: [10, 20, 50, 100]
      }" :min-height="550" remote @update:page="handleChangePage"
        @update:page-size="handlePageSizeChange" />
    </NCard>

    <!-- 调整积分弹窗 -->
    <NModal v-model:show="showAdjustModal" :mask-closable="false" preset="dialog" title="调整积分">
      <NForm ref="formRef" :model="adjustForm" :rules="rules" label-placement="left" :label-width="100">
        <NFormItem label="用户ID" path="userId">
          <NInputNumber v-model:value="adjustForm.userId" placeholder="请输入用户ID" style="width: 100%" />
        </NFormItem>
        <NFormItem label="积分变动" path="points">
          <NInputNumber v-model:value="adjustForm.points" placeholder="正数为增加，负数为减少" style="width: 100%" />
        </NFormItem>
        <NFormItem label="操作说明" path="description">
          <NInput v-model:value="adjustForm.description" type="textarea" placeholder="请输入操作说明"
            :autosize="{ minRows: 3, maxRows: 5 }" />
        </NFormItem>
      </NForm>
      <template #action>
        <NSpace>
          <NButton @click="showAdjustModal = false">取消</NButton>
          <NButton type="primary" :loading="submitLoading" @click="handleSubmitAdjust">确认</NButton>
        </NSpace>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, h } from 'vue';
import type { DataTableColumns, FormRules, FormInst } from 'naive-ui';
import { fetchPointsHistory, adjustUserPoints } from '@/service/api/points';
import { formatDate } from '@/utils/date';


// 积分历史记录
const pointsHistory = ref<Api.Points.PointsRecord[]>([]);
const loading = ref(false);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(10);

// 查询参数
const searchParams = reactive<Api.Points.PointsHistoryParams>({
  page: 1,
  limit: 10,
  username: '',
  transactionType: undefined,
  startDate: '',
  endDate: ''
});

// 日期范围
const dateRange = ref<[number, number] | null>(null);

// 交易类型选项
const transactionTypeOptions = [
  { label: '注册奖励', value: 'register_bonus' },
  { label: '视频扣除', value: 'video_deduction' },
  { label: '失败返还', value: 'video_refund' },
  { label: '每日签到', value: 'daily_check' },
  { label: '分享奖励', value: 'share_bonus' },
  { label: '管理员增加', value: 'manual_add' },
  { label: '管理员扣除', value: 'manual_deduct' }
];

const handleChangePage = (page: number) => {
  currentPage.value = page;
  searchParams.page = page;
  getPointsHistory();
}
const handlePageSizeChange = (size: number) => {
  pageSize.value = size;
  searchParams.limit = size;
  searchParams.page = 1;
  currentPage.value = 1;
  getPointsHistory();
}
// 表格列定义
const columns: DataTableColumns<Api.Points.PointsRecord> = [
  {
    title: 'ID',
    key: 'id',
    width: 80,
    align: 'center'
  },
  {
    title: '账号',
    key: 'username',
    width: 120,
    align: 'center'
  },
  {
    title: '昵称',
    key: 'nickname',
    width: 120,
    align: 'center'
  },
  {
    title: '积分变动',
    key: 'points',
    width: 120,
    align: 'center',
    render(row) {
      const value = row.points;
      const isPositive = value > 0;
      return h(
        'span',
        {
          style: {
            color: isPositive ? '#18a058' : '#d03050'
          }
        },
        `${isPositive ? '+' : ''}${value}`
      );
    }
  },
  {
    title: '变动后余额',
    key: 'balance',
    width: 120,
    align: 'center'
  },
  {
    title: '交易类型',
    key: 'transactionType',
    width: 120,
    align: 'center',
    render(row) {
      const typeMap = {
        register_bonus: '注册赠送',
        video_deduction: '视频扣除',
        video_refund: '失败返还',
        daily_check: '每日签到',
        share_bonus: '分享奖励',
        manual_add: '管理员增加',
        manual_deduct: '管理员扣除'
      };
      return typeMap[row.transactionType] || row.transactionType;
    }
  },
  {
    title: '说明',
    key: 'description',
    minWidth: 200,
    ellipsis: {
      tooltip: true
    }
  },
  {
    title: '创建时间',
    key: 'createdAt',
    width: 180,
    render(row: any) {
      return formatDate(row.createdAt);
    },
    align: 'center'
  }
];

// 调整积分弹窗相关
const showAdjustModal = ref(false);
const submitLoading = ref(false);
const formRef = ref<FormInst | null>(null);

// 调整积分表单
const adjustForm = reactive({
  userId: null as number | null,
  points: null as number | null,
  description: ''
});

// 表单验证规则
const rules: FormRules = {
  userId: [
    {
      required: true,
      type: 'number',
      message: '请输入用户ID',
      trigger: ['input', 'blur']
    }
  ],
  points: [
    {
      required: true,
      type: 'number',
      message: '请输入积分变动值',
      trigger: ['input', 'blur']
    }
  ],
  description: [
    {
      required: true,
      message: '请输入操作说明',
      trigger: ['input', 'blur']
    }
  ]
};

// 获取积分历史记录
async function getPointsHistory() {
  try {
    loading.value = true;
    const res = await fetchPointsHistory(searchParams);
    const data: any = res.data || {};
    pointsHistory.value = data.records || [];
    total.value = data.total || 0;
  } catch (error) {
    console.error('获取积分历史失败:', error);
    window.$message?.error('获取积分历史失败');
  } finally {
    loading.value = false;
  }
}
// 搜索
function handleSearch() {
  currentPage.value = 1;
  searchParams.page = 1;
  getPointsHistory();
}

// 重置
function handleReset() {
  searchParams.username = '';
  searchParams.transactionType = undefined;
  searchParams.startDate = '';
  searchParams.endDate = '';
  dateRange.value = null;
  currentPage.value = 1;
  searchParams.page = 1;
  getPointsHistory();
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


// 打开调整积分弹窗
function handleAddPoints() {
  adjustForm.userId = null;
  adjustForm.points = null;
  adjustForm.description = '';
  showAdjustModal.value = true;
}

// 提交调整积分
async function handleSubmitAdjust() {
  try {
    await formRef.value?.validate();
    submitLoading.value = true;

    // 由于request的transformBackendResponse配置，直接返回数据对象
    await adjustUserPoints({
      userId: adjustForm.userId!,
      points: adjustForm.points!,
      description: adjustForm.description
    });

    // 请求成功，不需要检查res.code
    window.$message?.success('积分调整成功');
    showAdjustModal.value = false;
    getPointsHistory();
  } catch (error) {
    console.error('调整积分失败:', error);
    window.$message?.error('调整积分失败');
  } finally {
    submitLoading.value = false;
  }
}
// 页面加载时获取数据
onMounted(() => {
  getPointsHistory();
});
</script>

<style scoped>
.card-wrapper {
  flex: 1;
  overflow: hidden;
}
</style>