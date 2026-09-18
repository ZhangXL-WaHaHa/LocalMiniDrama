<template>
  <div class="app-shell" :class="{ 'app-shell--bare': isBare }">
    <!-- 左侧导航栏（芒果灵创 workbench rail） -->
    <aside v-if="!isBare" class="app-rail">
      <button class="rail-logo" title="返回首页" aria-label="返回首页" @click="router.push('/')">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="rail-logo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f5e6c4" />
              <stop offset="60%" stop-color="#dcae5f" />
              <stop offset="100%" stop-color="#c9973f" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#rail-logo-grad)" />
          <path d="M26 21.5c0-1.9 2.1-3.1 3.7-2.1l14.9 9.1c1.6 1 1.6 3.3 0 4.3l-14.9 9.1c-1.6 1-3.7-.2-3.7-2.1v-18.3z" fill="#1a1715" />
          <rect x="18" y="20" width="4.5" height="24" rx="2.25" fill="#1a1715" />
        </svg>
      </button>

      <nav class="rail-nav" aria-label="主导航">
        <button
          v-for="item in navItems"
          :key="item.to"
          class="rail-item"
          :class="{ 'is-active': isActive(item) }"
          :title="item.label"
          :aria-label="item.label"
          :aria-current="isActive(item) ? 'page' : undefined"
          @click="router.push(item.to)"
        >
          <el-icon :size="20"><component :is="item.icon" /></el-icon>
        </button>
      </nav>

      <div class="rail-footer">
        <button
          v-if="!vendorLockEnabled"
          class="rail-item"
          title="扫码联系作者"
          aria-label="扫码联系作者"
          @click="showWechat = true"
        >
          <el-icon :size="20"><ChatDotSquare /></el-icon>
        </button>
        <button
          class="rail-item"
          :title="isDark ? '切换到浅色模式' : '切换到暗色模式'"
          :aria-label="isDark ? '切换到浅色模式' : '切换到暗色模式'"
          @click="toggleTheme"
        >
          <el-icon :size="20"><Sunny v-if="isDark" /><Moon v-else /></el-icon>
        </button>
      </div>
    </aside>

    <!-- 主内容区 -->
    <div class="app-main">
      <router-view />
    </div>

    <!-- 微信二维码 -->
    <el-dialog v-if="!vendorLockEnabled" v-model="showWechat" title="微信联系作者" width="320px" align-center>
      <div style="text-align:center;padding:8px 0 4px">
        <img src="/wx.jpg" alt="微信二维码" style="width:240px;height:240px;object-fit:contain;border-radius:8px;" />
        <p style="margin:12px 0 0;font-size:13px;color:var(--text-muted,#b3aca0);">扫码添加微信，欢迎交流</p>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElDialog, ElIcon } from 'element-plus'
import { HomeFilled, Setting, Sunny, Moon, ChatDotSquare } from '@element-plus/icons-vue'
import { useTheme } from '@/composables/useTheme'
import { aiAPI } from '@/api/ai'

const route = useRoute()
const router = useRouter()
const { isDark, toggle: toggleTheme } = useTheme()

const showWechat = ref(false)
const vendorLockEnabled = ref(false)

const navItems = [
  { to: '/', label: '项目首页', icon: HomeFilled, match: (p) => p === '/' },
  { to: '/ai-config', label: 'AI 配置', icon: Setting, match: (p) => p.startsWith('/ai-config') },
]

const isBare = computed(() => !!route.meta.bare)

function isActive(item) {
  return item.match(route.path)
}

onMounted(async () => {
  try {
    const lock = await aiAPI.getVendorLock()
    vendorLockEnabled.value = !!lock?.enabled
  } catch (_) {}
})
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  display: flex;
}

/* ── 左侧导航栏：毛玻璃暖黑 rail（同芒果灵创 --app-surface-rail） ── */
.app-rail {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 56px;
  z-index: 1200;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0 12px;
  gap: 6px;
  background: rgba(11, 10, 9,  0.94);
  backdrop-filter: blur(1.25rem);
  -webkit-backdrop-filter: blur(1.25rem);
  border-right: 1px solid rgba(247, 243, 239, 0.08);
}
html.light .app-rail {
  background: rgba(251, 248, 244, 0.94);
  border-right-color: var(--border-color, #e5ded4);
}

.rail-logo {
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s var(--ease-out, cubic-bezier(.16, 1, .3, 1)), filter 0.2s;
}
.rail-logo svg { width: 32px; height: 32px; display: block; }
.rail-logo:hover { transform: scale(1.08); filter: drop-shadow(0 0 10px rgba(201, 151, 63,  0.4)); }
.rail-logo:focus-visible { outline: 2px solid var(--accent-400, #dcae5f); outline-offset: 2px; }

.rail-nav {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  flex: 1;
}

.rail-item {
  position: relative;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--text-subtle, #8b8478);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.18s var(--ease-out, cubic-bezier(.16, 1, .3, 1)), color 0.18s;
}
html.light .rail-item { color: var(--text-subtle, #8b8478); }
.rail-item:hover {
  background: rgba(72, 69, 65, 0.62);
  color: var(--text-bright, #f5efe5);
}
html.light .rail-item:hover { background: var(--bg-hover, #f0ebe4); color: var(--text-bright, #1a1715); }
.rail-item:focus-visible { outline: 2px solid var(--accent-400, #dcae5f); outline-offset: 1px; }
.rail-item.is-active {
  background: rgba(201, 151, 63,  0.12);
  color: var(--accent-400, #dcae5f);
}
html.light .rail-item.is-active { background: rgba(201, 151, 63,  0.1); color: var(--accent-600, #ab7c30); }
.rail-item.is-active::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  border-radius: 0 3px 3px 0;
  background: var(--accent-500, #c9973f);
}

.rail-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid rgba(247, 243, 239, 0.08);
}
html.light .rail-footer { border-top-color: var(--border-color, #e5ded4); }

/* ── 主内容区 ── */
.app-main {
  flex: 1;
  min-width: 0;
  min-height: 100vh;
  margin-left: 56px;
}
.app-shell--bare .app-main { margin-left: 0; }

@media (max-width: 768px) {
  .app-rail { width: 48px; }
  .app-main { margin-left: 48px; }
  .rail-item { width: 36px; height: 36px; }
}
</style>
