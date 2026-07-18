<template>
  <el-container class="admin-app animate-fade-in">
    <!-- 左侧极客暗黑导航 -->
    <el-aside width="260px" class="main-aside">
      <div class="brand-header">
        <div class="logo-icon">M</div>
        <div class="brand-text">
          <h4>末日特工队</h4>
          <p>全栈多渠道运营中枢</p>
        </div>
      </div>
      <el-menu :default-active="currentChannelId" @select="changeChannel" class="side-menu">
        <el-menu-item-group title="发布渠道维度切换">
          <el-menu-item index="1"><el-icon><ChatDotRound /></el-icon>微信小游戏 (WECHAT)</el-menu-item>
          <el-menu-item index="2"><el-icon><Iphone /></el-icon>Android 原生</el-menu-item>
          <el-menu-item index="6"><el-icon><Link /></el-icon>4399 H5 平台</el-menu-item>
          <el-menu-item index="0"><el-icon><Monitor /></el-icon>默认测试环境</el-menu-item>
        </el-menu-item-group>
      </el-menu>
    </el-aside>

    <!-- 右侧操作区 -->
    <el-container class="main-container">
      <el-header class="main-header">
        <div class="header-left">
          <el-tag type="primary" effect="dark" class="channel-badge">当前调度：{{ channelName }}</el-tag>
        </div>
        <el-button type="primary" class="glow-btn" @click="saveAndPublish">下发并广播该通道配置</el-button>
      </el-header>

      <el-main class="main-body">
        <el-tabs v-model="activeTab" class="custom-tabs">
          <!-- 模块 1: 公告控制 -->
          <el-tab-pane name="notice">
            <template #label><span class="tab-label-item"><el-icon><Notification /></el-icon> 实时热下发公告</span></template>
            <div class="pane-card">
              <el-form label-position="top">
                <el-form-item label="通告公开状态"><el-switch v-model="configData.notice.isOpen" active-text="前台可见" inactive-text="全服下线" /></el-form-item>
                <el-form-item label="通告醒目标题"><el-input v-model="configData.notice.title" /></el-form-item>
                <el-form-item label="滚动公告内容正文"><el-input type="textarea" :rows="6" v-model="configData.notice.content" /></el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <!-- 模块 2: 动态兜底参数 -->
          <el-tab-pane name="params">
            <template #label><span class="tab-label-item"><el-icon><Cpu /></el-icon> SDK 策略矩阵</span></template>
            <div class="pane-card">
              <el-form label-width="150px" label-position="left">
                <el-form-item label="当前客户端版本 (v)"><el-input v-model="configData.params.gameVersion" /></el-form-item>
                <el-form-item label="激励视频 ID (Reward)"><el-input v-model="configData.params.rewardId" /></el-form-item>
                <el-form-item label="插屏广告 ID (Inter)"><el-input v-model="configData.params.interstitialId" /></el-form-item>
                <el-form-item label="全服灰度版本控制">
                  <el-select v-model="configData.params.appVersion" style="width: 100%">
                    <el-option label="1 - 审核拦截模式" :value="1" />
                    <el-option label="2 - 正式全放量模式" :value="2" />
                  </el-select>
                </el-form-item>
                <el-divider />
                <el-form-item label="全服熔断开关">
                  <el-checkbox v-model="configData.params.isCloseAd" border>熔断关闭全服广告</el-checkbox>
                  <el-checkbox v-model="configData.params.isMistouch" border>强制注入误触回弹流</el-checkbox>
                </el-form-item>
              </el-form>
            </div>
          </el-tab-pane>

          <!-- 模块 3: 原汁原味转换控制 -->
          <el-tab-pane name="excel">
            <template #label><span class="tab-label-item"><el-icon><DataAnalysis /></el-icon> 策划数值干预矩阵</span></template>
            <div class="pane-card">
              <el-row :gutter="40">
                <el-col :span="14">
                  <el-upload class="excel-uploader" drag action="/api/upload-excel" name="excelFile" accept=".xlsx" :on-success="handleUploadSuccess" :before-upload="beforeExcelUpload">
                    <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                    <div class="el-upload__text">将策划交付的最新 Excel 关卡/怪物表拖到此处，或 <em>点击上传</em></div>
                  </el-upload>
                </el-col>
                <el-col :span="10" style="display: flex; align-items: center;">
                  <div style="width: 100%; text-align: center;">
                    <div v-if="isConverting" style="margin-bottom: 20px;">
                      <el-progress :percentage="100" status="success" indeterminate :duration="2" />
                      <p style="font-size: 12px; color: #64748b; margin-top: 8px;">云端核心正在重构数据链...</p>
                    </div>
                    <el-button type="warning" size="large" :loading="isConverting" style="width: 100%; height: 50px;" @click="triggerExcelConvert">
                      <el-icon><Refresh /></el-icon>触发云端引擎自动编译 design.json
                    </el-button>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ChatDotRound, Iphone, Link, Monitor, Notification, Cpu, DataAnalysis, Refresh, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const currentChannelId = ref('1')
const activeTab = ref('notice')
const isConverting = ref(false)

const configData = reactive({
  notice: { isOpen: true, title: '全服更新维护公告', content: '1. 修复部分渲染核心异常\n2. 武器爆率全面回升' },
  params: { gameVersion: '1.3.0', appVersion: 2, rewardId: 'adunit-wx-video-mrtgd01', interstitialId: 'adunit-wx-inter-mrtgd02', isCloseAd: false, isMistouch: true }
})

const channelName = computed(() => {
  const map: any = { '1': '微信小游戏 (WECHAT)', '2': 'Android 原生', '6': '4399 H5 平台', '0': '默认测试环境' }
  return map[currentChannelId.value]
})

const changeChannel = (index: string) => { currentChannelId.value = index }

const beforeExcelUpload = (file: any) => {
  if (!file.name.endsWith('.xlsx')) { ElMessage.error('只允许上传标准的 .xlsx 策划格式表格'); return false; }
  if (file.name.startsWith('~')) { ElMessage.error('请关闭本地 Excel 软件后再上传，避免隐藏文件干扰'); return false; }
  return true;
}

const handleUploadSuccess = (res: any) => {
  if (res.code === 200) ElMessage.success(res.msg);
}

const saveAndPublish = async () => {
  try {
    const response = await fetch('/api/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: currentChannelId.value, ...configData })
    });
    const res = await response.json();
    if (res.code === 200) ElMessage.success(`[${channelName.value}] 策略分发成功！`);
  } catch (err) {
    ElMessage.error('边缘网络连接中断');
  }
}

const triggerExcelConvert = async () => {
  isConverting.value = true;
  try {
    const response = await fetch('/api/convert-excel', { method: 'POST' });
    const res = await response.json();
    if (res.code === 200) ElMessage({ message: res.msg, type: 'success', duration: 5000 });
  } catch (err) {
    ElMessage.error('引擎执行发生致命断流');
  } finally {
    isConverting.value = false;
  }
}
</script>

<style scoped>
.admin-app { height: 100vh; background-color: #f8fafc; }
.main-aside { background-color: #0f172a; border-right: 1px solid #1e293b; }
.brand-header { height: 75px; background-color: #020617; display: flex; align-items: center; padding: 0 20px; gap: 12px; }
.logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; box-shadow: 0 0 12px rgba(59, 130, 246, 0.5); }
.brand-text h4 { color: #f8fafc; margin: 0; font-size: 14px; }
.brand-text p { color: #64748b; margin: 2px 0 0; font-size: 11px; }
.side-menu { border-right: none; margin-top: 15px; }
:deep(.el-menu-item) { color: #94a3b8; margin: 4px 12px; border-radius: 8px; height: 50px; }
:deep(.el-menu-item.is-active) { background: linear-gradient(90deg, #2563eb, #1d4ed8) !important; color: #fff !important; }
.main-container { background-color: #f1f5f9; }
.main-header { background-color: #ffffff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; height: 75px; }
.glow-btn { background: linear-gradient(135deg, #2563eb, #7c3aed); border: none; font-weight: 600; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4); color: white; }
.main-body { padding: 30px; }
.pane-card { background-color: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; }
.pane-header { margin-bottom: 25px; border-left: 4px solid #2563eb; padding-left: 15px; }
.pane-header h3 { margin: 0; font-size: 16px; }
.pane-header p { margin: 5px 0 0; font-size: 13px; color: #64748b; }
.excel-uploader { width: 100%; }
.tab-label-item { display: flex; align-items: center; gap: 8px; }
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>