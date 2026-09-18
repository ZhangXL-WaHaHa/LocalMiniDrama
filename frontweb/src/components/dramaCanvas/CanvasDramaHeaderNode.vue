<template>
  <div class="canvas-drama-header">
    <div class="title">{{ data.drama?.title || '未命名项目' }}</div>
    <div class="meta">
      <span v-if="data.drama?.style">风格 {{ data.drama.style }}</span>
      <span>{{ (data.drama?.episodes || []).length }} 集</span>
      <span>{{ assetCount }} 素材</span>
      <span>{{ storyboardCount }} 分镜</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Object, required: true },
})

const assetCount = computed(() => {
  const d = props.data.drama || {}
  return (d.characters?.length || 0) + (d.scenes?.length || 0) + (d.props?.length || 0)
})

const storyboardCount = computed(() =>
  (props.data.drama?.episodes || []).reduce((n, ep) => n + (ep.storyboards?.length || 0), 0)
)
</script>

<style scoped>
.canvas-drama-header {
  min-width: 280px;
  padding: 14px 18px;
  border-radius: 12px;
  border: 1px solid rgba(220, 174, 95,   0.45);
  background: linear-gradient(135deg, rgba(201, 151, 63,  0.14), rgba(23, 21, 19,  0.92));
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35);
}
.title {
  font-size: 16px;
  font-weight: 700;
  color: #f5f1ec;
  margin-bottom: 6px;
}
.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: #b3aca0;
}
</style>
