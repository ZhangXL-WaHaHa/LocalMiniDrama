<template>
  <div class="ai-config">
    <header class="header">
      <div class="header-inner">
        <h1 class="logo" @click="goList">
          <span class="logo-main">本地短剧助手</span>
          <span class="logo-sub">LocalMiniDrama</span>
        </h1>
        <span class="page-title">AI 配置</span>
        <el-button class="btn-back" @click="goList">
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </header>

    <main class="main">
      <AIConfigContent />
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ArrowLeft } from '@element-plus/icons-vue'
import AIConfigContent from '@/components/AIConfigContent.vue'

const router = useRouter()

function goList() {
  router.push({ name: 'list' })
}
</script>

<style scoped>
.ai-config {
  min-height: 100vh;
  background: #100f0e;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% -20%, rgba(201, 151, 63,  0.1) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 110%, rgba(220, 174, 95,  0.06) 0%, transparent 60%);
}
html.light .ai-config {
  background: #f7efdd;
  background-image:
    radial-gradient(ellipse 80% 50% at 20% -20%, rgba(220, 174, 95,   0.12) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 110%, rgba(201, 151, 63,   0.08) 0%, transparent 60%);
}
.header {
  background: rgba(21, 19, 18,  0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid rgba(220, 174, 95,   0.18);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.4);
  position: sticky;
  top: 0;
  z-index: 100;
}
html.light .header {
  background: rgba(255, 255, 255, 0.85);
  border-bottom-color: rgba(220, 174, 95,   0.2);
  box-shadow: 0 2px 16px rgba(220, 174, 95,   0.08);
}
.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}
.logo {
  margin: 0;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 1px;
  line-height: 1;
  transition: filter 0.3s;
}
.logo:hover {
  filter: drop-shadow(0 0 10px rgba(220, 174, 95,   0.5));
}
.logo-main {
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(146deg, #f5e6c4 0.67%, #c9973f 99.57%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.logo-sub {
  font-size: 0.68rem;
  font-weight: 400;
  letter-spacing: 0.02em;
  color: #7d766c;
  -webkit-text-fill-color: #7d766c;
}
html.light .logo-main {
  background: linear-gradient(146deg, #f5e6c4 0.67%, #c9973f 99.57%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
html.light .logo-sub {
  color: #a8a29a;
  -webkit-text-fill-color: #a8a29a;
}
.page-title {
  flex: 1;
  font-size: 16px;
  color: #b3aca0;
}
html.light .page-title { color: #7d766c; }
.main {
  max-width: 1200px;
  margin: 24px auto;
  background: rgba(23, 21, 19,   0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid rgba(74, 69, 63,  0.7);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
}
html.light .main {
  background: rgba(255, 255, 255, 0.88);
  border-color: rgba(220, 174, 95,  0.15);
  box-shadow: 0 4px 20px rgba(220, 174, 95,  0.08);
}

/* ── 移动端适配 ── */
@media (max-width: 768px) {
  .header { padding: 10px 14px; }
  .header-inner { flex-wrap: wrap; gap: 8px; }
  .logo-sub { display: none; }
  .main { margin: 12px; padding: 14px; border-radius: 12px; }
}
</style>
