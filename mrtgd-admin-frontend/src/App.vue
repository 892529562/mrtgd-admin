<template>
  <el-config-provider :locale="zhCn">
    <el-container class="admin-app">
      <!-- 左侧极简科技感侧边栏 -->
      <el-aside width="260px" class="main-aside">
        <div class="brand-header">
          <div class="logo-icon">M</div>
          <div class="brand-text">
            <h4>末日特工队</h4>
            <p>运营数据控制台</p>
          </div>
        </div>
        
        <el-menu :default-active="currentChannelId" @select="changeChannel" class="side-menu">
          <el-menu-item-group title="多渠道策略调度 (Channel)">
            <el-menu-item index="1">
              <el-icon><ChatDotRound /></el-icon>
              <span>微信小游戏 (WECHAT)</span>
            </el-menu-item>
            <el-menu-item index="2">
              <el-icon><Iphone /></el-icon>
              <span>Android 原生</span>
            </el-menu-item>
            <el-menu-item index="6">
              <el-icon><Link /></el-icon>
              <span>4399 H5 平台</span>
            </el-menu-item>
            <el-menu-item index="0">
              <el-icon><Monitor /></el-icon>
              <span>默认 / 测试环境</span>
            </el-menu-item>
          </el-menu-item-group>
        </el-menu>
      </el-aside>

      <!-- 右侧核心工作区 -->
      <el-container class="main-container">
        <!-- 沉浸式顶部通栏 -->
        <el-header class="main-header">
          <div class="header-left">
            <el-breadcrumb separator="/">
              <el-breadcrumb-item>运营中心</el-breadcrumb-item>
              <el-breadcrumb-item>配置矩阵</el-breadcrumb-item>
            </el-breadcrumb>
            <el-tag type="primary" effect="plain" class="channel-badge">
              当前维度：{{ channelName }}
            </el-tag>
          </div>
          <div class="header-right">
            <el-button type="primary" size="large" class="glow-btn" @click="saveAndPublish">
              <el-icon><Compass /></el-icon>发布并广播当前配置
            </el-button>
          </div>
        </el-header>

        <!-- 滚动主视窗 -->
        <el-main class="main-body">
          <el-tabs v-model="activeTab" class="custom-tabs">
            
            <!-- 标签页 1：公告栏热下发 -->
            <el-tab-pane name="notice">
              <template #label>
                <span class="tab-label-item"><el-icon><Notification /></el-icon> 实时滚动公告</span>
              </template>
              <div class="pane-card animate-fade-in">
                <div class="pane-header">
                  <h3>游戏内公告排期</h3>
                  <p>在此配置的数据将绕过 Cocos 引擎旧版 LabelOutline 渲染层，直接通过数据链下发至游戏 LoadingLayer 弹窗。</p>
                </div>
                <el-form label-position="top" class="custom-form">
                  <el-form-item label="公告全局分发状态">
                    <el-radio-group v-model="configData.notice.isOpen">
                      <el-radio-button :label="true">立即激活公网可见</el-radio-button>
                      <el-radio-button :label="false">全服下线/隐藏</el-radio-button>
                    </el-radio-group>
                  </el-form-item>
                  <el-form-item label="核心公告通告标题">
                    <el-input v-model="configData.notice.title" placeholder="请输入前台弹窗醒目标题..." maxLength="40" show-word-limit />
                  </el-form-item>
                  <el-form-item label="富文本通告正文">
                    <el-input type="textarea" :rows="6" v-model="configData.notice.content" placeholder="支持使用 \n 进行客户端换行换页..." />
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <!-- 标签页 2：广告与热更新参数 -->
            <el-tab-pane name="params">
              <template #label>
                <span class="tab-label-item"><el-icon><Cpu /></el-icon> SDK 策略 & 广告矩阵</span>
              </template>
              <div class="pane-card animate-fade-in">
                <div class="pane-header">
                  <h3>环境与灰度控制 (SDKManager)</h3>
                </div>
                <el-form label-width="150px" label-position="left" class="custom-form">
                  <el-row :gutter="40">
                    <el-col :span="12">
                      <el-form-item label="游戏版本 (gameVersion)">
                        <el-input v-model="configData.params.gameVersion" placeholder="例如: 1.2.5" />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="灰度版本 (appVersion)">
                        <el-select v-model="configData.params.appVersion" style="width: 100%">
                          <el-option label="1 - 审核屏蔽版 (安全模式)" :value="1" />
                          <el-option label="2 - 正式全量版 (全活动开启)" :value="2" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>

                  <h3 class="inner-title">多开广告位单元绑实 ID</h3>
                  <el-form-item label="激励视频 ID (Reward)">
                    <el-input v-model="configData.params.rewardId" placeholder="输入 SDK 激励视频代码..." />
                  </el-form-item>
                  <el-form-item label="插屏广告 ID (Inter)">
                    <el-input v-model="configData.params.interstitialId" placeholder="输入 SDK 插屏代码..." />
                  </el-form-item>
                  <el-form-item label="轮播 Banner 集合">
                    <el-input type="textarea" :rows="2" v-model="configData.params.bannerIds" placeholder="多个广告单元请用英文分号 ; 隔开" />
                  </el-form-item>

                  <el-divider />
                  <el-form-item label="动态兜底策略">
                    <el-space size="large">
                      <el-checkbox v-model="configData.params.isCloseAd" border>全服熔断/关闭广告</el-checkbox>
                      <el-checkbox v-model="configData.params.isMistouch" border>动态注入误触流</el-checkbox>
                    </el-space>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <!-- 标签页 3：深度融合原厂 excelconvert 引擎 -->
            <el-tab-pane name="excel">
              <template #label>
                <span class="tab-label-item"><el-icon><DataAnalysis /></el-icon> 策划数值干预矩阵</span>
              </template>
              <div class="pane-card text-center animate-fade-in py-5">
                <el-empty description="数据工作流就绪" :image-size="120">
                  <div class="excel-console">
                    <h4>基于本地原生 <span>excelconvert.js</span> 自动化工作流</h4>
                    <p class="mb-4 text-muted">点击下方按钮后，云端服务器将自动遍历并解开数据文件夹中由策划交付的 Excel 表格（如关卡、怪物、弹道数据），并自动刷新重写游戏底层强依赖的 design.json。</p>
                    
                    <div v-if="isConverting" class="progress-box">
                      <el-progress :percentage="100" :status="'success'" indeterminate :duration="2" />
                      <p class="progress-text">云端核心正在解析并聚合 Buff 缓冲数据...</p>
                    </div>

                    <el-button type="warning" size="large" :loading="isConverting" class="excel-btn" @click="triggerExcelConvert">
                      <el-icon><Refresh /></el-icon>
                      {{ isConverting ? '底册数据多流同步中...' : '一键自动重构并编译 design.json' }}
                    </el-button>
                  </div>
                </el-empty>
              </div>
            </el-tab-pane>

          </el-tabs>
        </el-main>
      </el-container>
    </el-container>
  </el-config-provider>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Platform, ChatDotRound, Iphone, Link, Monitor, Compass, Notification, Cpu, DataAnalysis, Refresh } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const currentChannelId = ref('1')
const activeTab = ref('notice')
const isConverting = ref(false)

const configData = reactive({
  notice: { isOpen: true, title: '系统更新与包体修复公告', content: '1. 修复部分机型因 LabelOutline 导致的加载警告\n2. 关卡产出金币效率提升 15%\n3. 优化小游戏内存占用' },
  params: { gameVersion: '1.2.8', appVersion: 2, rewardId: 'adunit-wx-video-mrtgd01', interstitialId: 'adunit-wx-inter-mrtgd02', bannerIds: 'b1;b2;b3', isCloseAd: false, isMistouch: true }
})

const channelName = computed(() => {
  const map: any = { '1': '微信小游戏 (WECHAT)', '2': 'Android 原生', '6': '4399 H5 平台', '0': '默认测试环境' }
  return map[currentChannelId.value]
})

const changeChannel = (index: string) => { 
  currentChannelId.value = index 
  ElMessage.info({ message: `主数据上下游已切换至：${channelName.value}`, duration: 2000 })
}

const saveAndPublish = async () => {
  try {
    const response = await fetch('/api/save-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel: currentChannelId.value, ...configData })
    });
    const res = await response.json();
    if (res.code === 200) ElMessage.success({ message: `[${channelName.value}] 策略已向边缘节点下发扩散并生效！`, duration: 3000 });
  } catch (err) {
    ElMessage.error('边缘网关无响应：请确保后端的 Node.js 服务已在生产环境执行。');
  }
}

const triggerExcelConvert = async () => {
  isConverting.value = true;
  try {
    const response = await fetch('/api/convert-excel', { method: 'POST' });
    const res = await response.json();
    if (res.code === 200) {
      ElMessage({ message: `【转化大成功】: ${res.msg}`, type: 'success', duration: 5000 });
    } else {
      ElMessage.error(res.msg);
    }
  } catch (err) {
    ElMessage.error('解析引擎异常：服务器未发现 data_excel 文件夹或包含损毁的 xlsx 二进制数据。');
  } finally {
    isConverting.value = false;
  }
}
</script>

<style scoped>
/* 全局页面美化与极客科技感 UI 样式 */
.admin-app { height: 100vh; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
.main-aside { background-color: #0f172a; border-right: 1px solid #1e293b; display: flex; flex-direction: column; }
.brand-header { height: 75px; background-color: #020617; display: flex; align-items: center; padding: 0 20px; gap: 12px; border-bottom: 1px solid #1e293b; }
.logo-icon { width: 36px; height: 36px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 18px; box-shadow: 0 0 12px rgba(59, 130, 246, 0.5); }
.brand-text h4 { color: #f8fafc; margin: 0; font-size: 15px; letter-spacing: 0.5px; }
.brand-text p { color: #64748b; margin: 2px 0 0; font-size: 11px; }
.side-menu { border-right: none; margin-top: 15px; }
:deep(.el-menu-item-group__title) { color: #475569 !important; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; }
:deep(.el-menu-item) { color: #94a3b8; height: 50px; line-height: 50px; margin: 4px 12px; border-radius: 8px; }
:deep(.el-menu-item:hover) { background-color: #1e293b !important; color: #fff; }
:deep(.el-menu-item.is-active) { background: linear-gradient(90deg, #2563eb, #1d4ed8) !important; color: #fff !important; font-weight: 600; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3); }

.main-container { background-color: #f1f5f9; }
.main-header { background-color: #ffffff; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; padding: 0 30px; height: 75px; box-shadow: 0 1px 3px rgba(0,0,0,0.02); }
.header-left { display: flex; align-items: center; gap: 20px; }
.channel-badge { font-weight: 600; font-size: 13px; padding: 6px 12px; border-radius: 6px; }
.glow-btn { background: linear-gradient(135deg, #2563eb, #7c3aed); border: none; font-weight: 600; border-radius: 8px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4); transition: transform 0.2s; gap: 6px; }
.glow-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124, 58, 237, 0.6); }

.main-body { padding: 30px; }
.custom-tabs { background: transparent; border: none; }
:deep(.el-tabs__header) { border: none; background: transparent; margin-bottom: 20px; }
:deep(.el-tabs__nav) { gap: 10px; }
:deep(.el-tabs__item) { background-color: #fff; border: 1px solid #e2e8f0 !important; border-radius: 8px !important; color: #64748b; font-weight: 500; height: 45px; transition: all 0.3s; }
:deep(.el-tabs__item.is-active) { background-color: #fff !important; color: #2563eb !important; border-color: #2563eb !important; font-weight: 600; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }

.tab-label-item { display: flex; align-items: center; gap: 8px; }
.pane-card { background-color: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
.pane-header { margin-bottom: 25px; border-left: 4px solid #2563eb; padding-left: 15px; }
.pane-header h3 { margin: 0; font-size: 18px; color: #0f172a; }
.pane-header p { margin: 6px 0 0; font-size: 13px; color: #64748b; line-height: 1.5; }

.custom-form { max-width: 900px; }
.inner-title { font-size: 15px; font-weight: 600; color: #1e293b; margin: 30px 0 15px; display: flex; align-items: center; gap: 8px; }
.inner-title::before { content: ''; display: inline-block; width: 6px; height: 6px; background-color: #7c3aed; border-radius: 50%; }

.excel-console h4 { font-size: 16px; margin: 15px 0 5px; color: #1e293b; }
.excel-console h4 span { color: #ea580c; font-family: monospace; }
.excel-btn { background: linear-gradient(135deg, #d97706, #ea580c); border: none; font-weight: 600; padding: 12px 30px; border-radius: 8px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.3); }
.progress-box { max-width: 500px; margin: 20px auto; }
.progress-text { font-size: 12px; color: #64748b; margin-top: 8px; }

.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
</style>