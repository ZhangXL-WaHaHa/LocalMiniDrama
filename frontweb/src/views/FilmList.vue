<template>
  <div class="film-list">
    <!-- Hero：放映厅首映 —— 开场序列 + 宽银幕 -->
    <section class="hero" @mousemove="onHeroMove">
      <!-- 巨型背景字 -->
      <div class="hero-backdrop" aria-hidden="true">CINEMA</div>
      <!-- 散景光斑 -->
      <div class="bokeh" aria-hidden="true">
        <span v-for="(b, i) in bokehLights" :key="'bk' + i" :style="b"></span>
      </div>
      <!-- 中轴光柱（放映机主光） -->
      <div class="godray" aria-hidden="true"></div>
      <!-- 放映光束（扫动） -->
      <div class="beam beam--left" aria-hidden="true"></div>
      <div class="beam beam--right" aria-hidden="true"></div>
      <!-- 光束中的尘埃 -->
      <div class="hero-dust" aria-hidden="true">
        <span
          v-for="n in 14"
          :key="'dust' + n"
          :style="{ left: (6 + n * 6.6) + '%', animationDelay: (n * 0.7) + 's', animationDuration: (6 + (n % 5) * 1.6) + 's' }"
        ></span>
      </div>

      <!-- 宽银幕（跑马灯上下边） -->
      <div class="screen">
        <div class="bulb-row" aria-hidden="true">
          <span
            v-for="n in 22"
            :key="'bt' + n"
            class="bulb"
            :style="{ animationDelay: (n * -0.16) + 's' }"
          ></span>
        </div>
        <div class="screen-body">
          <p class="hero-eyebrow">
            <span class="eyebrow-star">★</span> NOW SHOWING · 本地上映 <span class="eyebrow-star">★</span>
          </p>
          <h1 class="hero-title">本地短剧助手</h1>
          <p class="hero-billing">LOCAL MINI DRAMA STUDIO</p>
          <p class="hero-sub">从剧本、分镜到成片 —— 一站式 AI 短剧创作工作台</p>
          <div class="hero-actions">
            <el-button type="primary" size="large" class="hero-btn-new" @click="goNewProject">
              <el-icon><Plus /></el-icon>新建项目
            </el-button>
            <el-button size="large" class="hero-btn-import" :loading="importing" @click="triggerImport">
              <el-icon><Upload /></el-icon>导入项目
            </el-button>
          </div>
          <div class="hero-credits">
            <span>AI 剧本</span><i aria-hidden="true"></i><span>智能分镜</span><i aria-hidden="true"></i><span>视频生成</span><i aria-hidden="true"></i><span>一站式生产</span>
          </div>
        </div>
        <!-- 放映机闪烁 -->
        <div class="projector-flicker" aria-hidden="true"></div>
        <div class="bulb-row" aria-hidden="true">
          <span
            v-for="n in 22"
            :key="'bb' + n"
            class="bulb"
            :style="{ animationDelay: (n * -0.16 + 1.2) + 's' }"
          ></span>
        </div>
      </div>

      <!-- 银幕地面光晕（舞台反光） -->
      <div class="screen-reflection" aria-hidden="true"></div>

      <!-- 票根统计 -->
      <div v-if="dramas.length" class="ticket-row">
        <div class="ticket">
          <span class="ticket-num">{{ dramas.length }}</span>
          <div class="ticket-info">
            <b>项目</b>
            <span>PROJECTS · ADMIT ALL</span>
          </div>
        </div>
        <div class="ticket">
          <span class="ticket-num">{{ totalEpisodes }}</span>
          <div class="ticket-info">
            <b>剧集</b>
            <span>EPISODES · REEL</span>
          </div>
        </div>
        <div class="ticket">
          <span class="ticket-num">{{ totalStoryboardsCount }}</span>
          <div class="ticket-info">
            <b>分镜</b>
            <span>STORYBOARDS · SCENE</span>
          </div>
        </div>
      </div>

      <!-- 红幕布（覆盖整个放映厅，闭合 → 向两侧拉开） -->
      <div class="curtain-reveal" aria-hidden="true">
        <div class="reveal-half reveal-half--left"></div>
        <div class="reveal-half reveal-half--right"></div>
      </div>
    </section>

    <main class="main">
      <!-- 胶片画廊（风格卷轴，无限滚动） -->
      <div class="reel-gallery" aria-hidden="true">
        <div class="reel-track">
          <div v-for="(g, i) in galleryLoop" :key="'gf' + i" class="reel-frame">
            <img :src="g.thumb" alt="" loading="lazy" />
            <span class="reel-frame-label">{{ g.label }}</span>
          </div>
        </div>
      </div>

      <!-- 正在上映 · 排片行 -->
      <div class="now-showing">
        <div class="ns-head">
          <div class="ns-title-group">
            <span class="ns-eyebrow">NOW SHOWING</span>
            <h2 class="ns-title">正在上映</h2>
            <span v-if="filteredDramas.length" class="ns-count">{{ filteredDramas.length }}</span>
          </div>
          <div class="toolbar-actions">
            <el-input v-model="searchKeyword" class="toolbar-search" placeholder="搜索项目" clearable>
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
            <el-dropdown trigger="click" @command="handleLibraryCmd">
              <el-button class="btn-library">
                <el-icon><FolderOpened /></el-icon>素材库<el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="char"><el-icon><User /></el-icon>角色素材</el-dropdown-item>
                  <el-dropdown-item command="scene"><el-icon><PictureFilled /></el-icon>场景素材</el-dropdown-item>
                  <el-dropdown-item command="prop"><el-icon><Box /></el-icon>道具素材</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
        <div class="ns-rule" aria-hidden="true"><i></i></div>
      </div>

      <div v-loading="loading" class="projects-wrap">
        <div class="poster-grid">
          <!-- 新建 / 导入（电影引片） -->
          <div class="poster-card poster-card--new" @click="goNewProject">
            <span class="leader-circle" aria-hidden="true"><el-icon><Plus /></el-icon></span>
            <span class="new-card-text">新建短剧项目</span>
          </div>
          <div class="poster-card poster-card--new" @click="triggerImport">
            <span class="leader-circle" :class="{ 'is-loading': importing }" aria-hidden="true">
              <el-icon v-if="!importing"><Upload /></el-icon>
              <el-icon v-else class="is-turning"><Loading /></el-icon>
            </span>
            <span class="new-card-text">{{ importing ? '导入中…' : '导入短剧项目' }}</span>
          </div>

          <div
            v-for="d in filteredDramas"
            :key="d.id"
            class="poster-card"
            @click="openProject(d.id)"
          >
            <div class="poster-media" :style="coverStyle(d)">
              <img
                v-if="posterImage(d) && !failedPosters.has(d.id)"
                class="poster-img"
                :src="posterImage(d)"
                alt=""
                loading="lazy"
                @error="onPosterError(d)"
              />
              <span class="poster-glyph" v-else>{{ coverGlyph(d) }}</span>

              <div class="poster-overlay">
                <span class="poster-status" :class="'poster-status--' + (d.status || 'draft')">{{ formatStatus(d.status) }}</span>
                <h3 class="poster-title">{{ d.title || '未命名项目' }}</h3>
                <p class="poster-sub">
                  <template v-if="d.episodes?.length">{{ d.episodes.length }} 集</template>
                  <template v-if="totalStoryboards(d) > 0"> · {{ totalStoryboards(d) }} 分镜</template>
                  <template v-if="d.style"> · {{ formatStyle(d.style) }}</template>
                </p>
              </div>

              <div class="poster-actions" @click.stop>
                <el-button size="small" circle :icon="Download" title="导出项目" :loading="exportingId === d.id" @click="onExport(d)" />
                <el-button size="small" circle :icon="Edit" title="编辑" @click="openEditDialog(d)" />
                <el-button size="small" type="danger" plain circle :icon="Delete" title="删除" @click="onDelete(d)" />
              </div>
            </div>
          </div>
        </div>
        <div v-if="!loading && filteredDramas.length === 0 && dramas.length > 0" class="empty">
          <svg class="empty-illust" viewBox="0 0 120 100" aria-hidden="true">
            <rect x="14" y="30" width="92" height="58" rx="8" fill="none" stroke="rgba(201, 151, 63, .35)" stroke-width="2"/>
            <path d="M14 44 L106 30 L106 22 L14 36 Z" fill="rgba(201, 151, 63, .18)" stroke="rgba(201, 151, 63, .5)" stroke-width="2" stroke-linejoin="round"/>
            <g fill="rgba(201, 151, 63, .5)">
              <rect x="22" y="30" width="8" height="6" rx="1" transform="rotate(-8 26 33)"/>
              <rect x="42" y="27" width="8" height="6" rx="1" transform="rotate(-8 46 30)"/>
              <rect x="62" y="24" width="8" height="6" rx="1" transform="rotate(-8 66 27)"/>
              <rect x="82" y="21" width="8" height="6" rx="1" transform="rotate(-8 86 24)"/>
            </g>
            <path d="M54 50 c0-2.2 2.4-3.5 4.3-2.4l13 8c1.9 1.1 1.9 3.7 0 4.8l-13 8c-1.9 1.1-4.3-.2-4.3-2.4v-16z" fill="rgba(220, 174, 95, .85)"/>
          </svg>
          <p class="empty-title">没有匹配的项目</p>
          <p class="empty-desc">换个关键词试试</p>
        </div>
        <!-- 新手试映 -->
        <div v-if="exampleList.length > 0" class="example-section">
          <div class="example-hint">
            <el-icon class="example-hint-icon"><QuestionFilled /></el-icon>
            <span class="example-hint-text">新手试映 · 导入示例项目，快速体验全流程</span>
          </div>
          <div class="example-list">
            <el-button
              v-for="ex in exampleList"
              :key="ex.filename"
              size="small"
              class="example-btn"
              :loading="importingExample === ex.filename"
              @click="onImportExample(ex)"
            >
              <el-icon><FolderOpened /></el-icon>{{ ex.name }}
            </el-button>
          </div>
        </div>
      </div>
    </main>

    <!-- 新建项目：先填标题和描述 -->
    <el-dialog
      v-model="showNewDialog"
      title="新建项目"
      width="480px"
      :close-on-click-modal="false"
      @closed="resetNewForm"
    >
      <el-form :model="newForm" label-width="80px" label-position="top">
        <el-form-item label="标题" required>
          <el-input v-model="newForm.title" placeholder="输入项目标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newForm.description" type="textarea" :rows="3" placeholder="输入项目描述（选填）" />
        </el-form-item>
        <el-form-item label="画面比例">
          <el-select v-model="newForm.aspect_ratio" style="width: 100%">
            <el-option label="16:9 横屏（默认）" value="16:9" />
            <el-option label="9:16 竖屏（短视频）" value="9:16" />
            <el-option label="3:4 竖版" value="3:4" />
            <el-option label="1:1 方形" value="1:1" />
            <el-option label="4:3 传统横屏" value="4:3" />
            <el-option label="21:9 宽银幕" value="21:9" />
          </el-select>
          <p style="margin: 4px 0 0; font-size: 12px; color: #8b8478;">影响分镜图和视频的生成比例，短视频选 9:16</p>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNewDialog = false">取消</el-button>
        <el-button type="primary" :loading="newSaving" :disabled="!newForm.title?.trim()" @click="submitNew">确定</el-button>
      </template>
    </el-dialog>

    <!-- 公共角色库 -->
    <el-dialog v-model="showCharLibrary" title="素材库 · 角色" width="720px" destroy-on-close class="library-dialog" @open="loadCharLibraryList">
      <div class="library-toolbar">
        <el-input v-model="charLibraryKeyword" placeholder="搜索名称或描述" clearable style="width: 200px" @input="debouncedLoadCharLibrary()" />
      </div>
      <div v-loading="charLibraryLoading" class="library-list">
        <div v-for="item in charLibraryList" :key="item.id" class="library-item">
          <div class="library-item-cover" @click="openImagePreview(assetImageUrl(item))">
            <img v-if="item.image_url || item.local_path" :src="assetImageUrl(item)" alt="" />
            <span v-else class="library-item-placeholder">暂无图</span>
          </div>
          <div class="library-item-info">
            <div class="library-item-name">{{ item.name || '未命名' }}</div>
            <div class="library-item-desc">{{ (item.description || '').slice(0, 60) }}{{ (item.description || '').length > 60 ? '…' : '' }}</div>
            <div class="library-item-actions">
              <el-button size="small" @click="openEditCharLibrary(item)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="onDeleteCharLibrary(item)">删除</el-button>
            </div>
          </div>
        </div>
        <div v-if="!charLibraryLoading && charLibraryList.length === 0" class="library-empty">素材库暂无角色，可在项目中将角色「加入素材库」后在此查看</div>
      </div>
      <div class="library-pagination">
        <el-pagination v-model:current-page="charLibraryPage" v-model:page-size="charLibraryPageSize" :total="charLibraryTotal" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @current-change="loadCharLibraryList" @size-change="loadCharLibraryList" />
      </div>
      <template #footer><el-button @click="showCharLibrary = false">关闭</el-button></template>
    </el-dialog>
    <!-- 编辑公共角色 -->
    <el-dialog v-model="showEditCharLibrary" title="编辑素材角色" width="480px" @close="editCharLibraryForm = null">
      <el-form v-if="editCharLibraryForm" label-width="80px">
        <el-form-item label="图片">
          <div class="lib-img-editor">
            <div class="lib-img-thumb" @click="openImagePreview(assetImageUrl(editCharLibraryForm))">
              <img v-if="editCharLibraryForm.image_url || editCharLibraryForm.local_path" :src="assetImageUrl(editCharLibraryForm)" />
              <div v-else class="lib-img-empty"><el-icon><PictureFilled /></el-icon></div>
            </div>
            <div class="lib-img-btns">
              <el-button size="small" :loading="editCharLibraryForm.imgUploading" @click="charLibFileRef.click()">上传图片</el-button>
              <el-button size="small" type="primary" :loading="editCharLibraryForm.imgGenerating" @click="doGenerateLibImg(editCharLibraryForm, (editCharLibraryForm.name + (editCharLibraryForm.description ? ', ' + editCharLibraryForm.description : '')), characterLibraryAPI, loadCharLibraryList)">AI 生成</el-button>
            </div>
          </div>
          <input ref="charLibFileRef" type="file" accept="image/*" style="display:none" @change="e => doUploadLibImg(e, editCharLibraryForm, characterLibraryAPI, loadCharLibraryList)" />
        </el-form-item>
        <el-form-item label="名称"><el-input v-model="editCharLibraryForm.name" placeholder="角色名称" /></el-form-item>
        <el-form-item label="分类"><el-input v-model="editCharLibraryForm.category" placeholder="可选" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="editCharLibraryForm.description" type="textarea" :rows="3" placeholder="可选" /></el-form-item>
        <el-form-item label="标签"><el-input v-model="editCharLibraryForm.tags" placeholder="可选，逗号分隔" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditCharLibrary = false">取消</el-button>
        <el-button type="primary" :loading="editCharLibrarySaving" @click="submitEditCharLibrary">保存</el-button>
      </template>
    </el-dialog>

    <!-- 公共场景库 -->
    <el-dialog v-model="showSceneLibrary" title="素材库 · 场景" width="720px" destroy-on-close class="library-dialog" @open="loadSceneLibraryList">
      <div class="library-toolbar">
        <el-input v-model="sceneLibraryKeyword" placeholder="搜索地点或描述" clearable style="width: 200px" @input="debouncedLoadSceneLibrary()" />
      </div>
      <div v-loading="sceneLibraryLoading" class="library-list">
        <div v-for="item in sceneLibraryList" :key="item.id" class="library-item">
          <div class="library-item-cover" @click="openImagePreview(assetImageUrl(item))">
            <img v-if="item.image_url || item.local_path" :src="assetImageUrl(item)" alt="" />
            <span v-else class="library-item-placeholder">暂无图</span>
          </div>
          <div class="library-item-info">
            <div class="library-item-name">{{ item.location || item.time || '未命名' }}</div>
            <div class="library-item-desc">{{ (item.description || item.prompt || '').slice(0, 60) }}{{ (item.description || item.prompt || '').length > 60 ? '…' : '' }}</div>
            <div class="library-item-actions">
              <el-button size="small" @click="openEditSceneLibrary(item)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="onDeleteSceneLibrary(item)">删除</el-button>
            </div>
          </div>
        </div>
        <div v-if="!sceneLibraryLoading && sceneLibraryList.length === 0" class="library-empty">素材库暂无场景，可在项目中将场景「加入素材库」后在此查看</div>
      </div>
      <div class="library-pagination">
        <el-pagination v-model:current-page="sceneLibraryPage" v-model:page-size="sceneLibraryPageSize" :total="sceneLibraryTotal" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @current-change="loadSceneLibraryList" @size-change="loadSceneLibraryList" />
      </div>
      <template #footer><el-button @click="showSceneLibrary = false">关闭</el-button></template>
    </el-dialog>
    <!-- 编辑公共场景 -->
    <el-dialog v-model="showEditSceneLibrary" title="编辑素材场景" width="480px" @close="editSceneLibraryForm = null">
      <el-form v-if="editSceneLibraryForm" label-width="80px">
        <el-form-item label="图片">
          <div class="lib-img-editor">
            <div class="lib-img-thumb" @click="openImagePreview(assetImageUrl(editSceneLibraryForm))">
              <img v-if="editSceneLibraryForm.image_url || editSceneLibraryForm.local_path" :src="assetImageUrl(editSceneLibraryForm)" />
              <div v-else class="lib-img-empty"><el-icon><PictureFilled /></el-icon></div>
            </div>
            <div class="lib-img-btns">
              <el-button size="small" :loading="editSceneLibraryForm.imgUploading" @click="sceneLibFileRef.click()">上传图片</el-button>
              <el-button size="small" type="primary" :loading="editSceneLibraryForm.imgGenerating" @click="doGenerateLibImg(editSceneLibraryForm, ([editSceneLibraryForm.location, editSceneLibraryForm.time, editSceneLibraryForm.description].filter(Boolean).join(', ')), sceneLibraryAPI, loadSceneLibraryList)">AI 生成</el-button>
            </div>
          </div>
          <input ref="sceneLibFileRef" type="file" accept="image/*" style="display:none" @change="e => doUploadLibImg(e, editSceneLibraryForm, sceneLibraryAPI, loadSceneLibraryList)" />
        </el-form-item>
        <el-form-item label="地点"><el-input v-model="editSceneLibraryForm.location" placeholder="场景地点" /></el-form-item>
        <el-form-item label="时间"><el-input v-model="editSceneLibraryForm.time" placeholder="如：浅色/夜晚" /></el-form-item>
        <el-form-item label="分类"><el-input v-model="editSceneLibraryForm.category" placeholder="可选" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="editSceneLibraryForm.description" type="textarea" :rows="3" placeholder="可选" /></el-form-item>
        <el-form-item label="标签"><el-input v-model="editSceneLibraryForm.tags" placeholder="可选，逗号分隔" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditSceneLibrary = false">取消</el-button>
        <el-button type="primary" :loading="editSceneLibrarySaving" @click="submitEditSceneLibrary">保存</el-button>
      </template>
    </el-dialog>

    <!-- 公共道具库 -->
    <el-dialog v-model="showPropLibrary" title="素材库 · 道具" width="720px" destroy-on-close class="library-dialog" @open="loadPropLibraryList">
      <div class="library-toolbar">
        <el-input v-model="propLibraryKeyword" placeholder="搜索名称或描述" clearable style="width: 200px" @input="debouncedLoadPropLibrary()" />
      </div>
      <div v-loading="propLibraryLoading" class="library-list">
        <div v-for="item in propLibraryList" :key="item.id" class="library-item">
          <div class="library-item-cover" @click="openImagePreview(assetImageUrl(item))">
            <img v-if="item.image_url || item.local_path" :src="assetImageUrl(item)" alt="" />
            <span v-else class="library-item-placeholder">暂无图</span>
          </div>
          <div class="library-item-info">
            <div class="library-item-name">{{ item.name || '未命名' }}</div>
            <div class="library-item-desc">{{ (item.description || item.prompt || '').slice(0, 60) }}{{ (item.description || item.prompt || '').length > 60 ? '…' : '' }}</div>
            <div class="library-item-actions">
              <el-button size="small" @click="openEditPropLibrary(item)">编辑</el-button>
              <el-button size="small" type="danger" plain @click="onDeletePropLibrary(item)">删除</el-button>
            </div>
          </div>
        </div>
        <div v-if="!propLibraryLoading && propLibraryList.length === 0" class="library-empty">素材库暂无道具，可在项目中将道具「加入素材库」后在此查看</div>
      </div>
      <div class="library-pagination">
        <el-pagination v-model:current-page="propLibraryPage" v-model:page-size="propLibraryPageSize" :total="propLibraryTotal" :page-sizes="[10, 20, 50]" layout="total, sizes, prev, pager, next" @current-change="loadPropLibraryList" @size-change="loadPropLibraryList" />
      </div>
      <template #footer><el-button @click="showPropLibrary = false">关闭</el-button></template>
    </el-dialog>
    <!-- 编辑公共道具 -->
    <el-dialog v-model="showEditPropLibrary" title="编辑素材道具" width="480px" @close="editPropLibraryForm = null">
      <el-form v-if="editPropLibraryForm" label-width="80px">
        <el-form-item label="图片">
          <div class="lib-img-editor">
            <div class="lib-img-thumb" @click="openImagePreview(assetImageUrl(editPropLibraryForm))">
              <img v-if="editPropLibraryForm.image_url || editPropLibraryForm.local_path" :src="assetImageUrl(editPropLibraryForm)" />
              <div v-else class="lib-img-empty"><el-icon><PictureFilled /></el-icon></div>
            </div>
            <div class="lib-img-btns">
              <el-button size="small" :loading="editPropLibraryForm.imgUploading" @click="propLibFileRef.click()">上传图片</el-button>
              <el-button size="small" type="primary" :loading="editPropLibraryForm.imgGenerating" @click="doGenerateLibImg(editPropLibraryForm, (editPropLibraryForm.name + (editPropLibraryForm.description ? ', ' + editPropLibraryForm.description : '')), propLibraryAPI, loadPropLibraryList)">AI 生成</el-button>
            </div>
          </div>
          <input ref="propLibFileRef" type="file" accept="image/*" style="display:none" @change="e => doUploadLibImg(e, editPropLibraryForm, propLibraryAPI, loadPropLibraryList)" />
        </el-form-item>
        <el-form-item label="名称"><el-input v-model="editPropLibraryForm.name" placeholder="道具名称" /></el-form-item>
        <el-form-item label="分类"><el-input v-model="editPropLibraryForm.category" placeholder="可选" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="editPropLibraryForm.description" type="textarea" :rows="3" placeholder="可选" /></el-form-item>
        <el-form-item label="标签"><el-input v-model="editPropLibraryForm.tags" placeholder="可选，逗号分隔" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditPropLibrary = false">取消</el-button>
        <el-button type="primary" :loading="editPropLibrarySaving" @click="submitEditPropLibrary">保存</el-button>
      </template>
    </el-dialog>

    <!-- 导入文件输入（隐藏） -->
    <input ref="importFileInput" type="file" accept=".zip" style="display:none" @change="onImportFile" />

    <!-- 图片放大预览 -->
    <Teleport to="body">
      <div v-if="previewImageUrl" class="image-preview-overlay" @click="previewImageUrl = null">
        <img :src="previewImageUrl" alt="" class="image-preview-img" @click.stop="previewImageUrl = null" />
      </div>
    </Teleport>

    <!-- 编辑项目：修改标题和故事 -->
    <el-dialog
      v-model="showEditDialog"
      title="编辑项目"
      width="480px"
      :close-on-click-modal="false"
      @closed="resetEditForm"
    >
      <el-form :model="editForm" label-width="80px" label-position="top">
        <el-form-item label="标题" required>
          <el-input v-model="editForm.title" placeholder="输入项目标题" maxlength="100" show-word-limit />
        </el-form-item>
        <el-form-item label="故事">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="输入故事梗概（选填）" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEditDialog = false">取消</el-button>
        <el-button type="primary" :loading="editSaving" :disabled="!editForm.title?.trim()" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Edit, Delete, Plus, User, PictureFilled, Box, Download, Upload, QuestionFilled, FolderOpened, Search, ArrowDown, Loading } from '@element-plus/icons-vue'
import { storyboardImageUrl } from '@/utils/mediaUrl'
import { dramaAPI } from '@/api/drama'
import { characterLibraryAPI } from '@/api/characterLibrary'
import { sceneLibraryAPI } from '@/api/sceneLibrary'
import { propLibraryAPI } from '@/api/propLibrary'
import { uploadAPI } from '@/api/upload'
import { imagesAPI } from '@/api/images'
import { taskAPI } from '@/api/task'
import { getStyleLabel, generationStyleOptions } from '@/constants/styleOptions'

const router = useRouter()

// 库编辑图片 – 文件输入 refs
const charLibFileRef  = ref(null)
const sceneLibFileRef = ref(null)
const propLibFileRef  = ref(null)

// 共享：上传图片
async function doUploadLibImg(event, form, api, reloadFn) {
  const file = event.target?.files?.[0]
  if (event.target) event.target.value = ''
  if (!file || !form?.id) return
  form.imgUploading = true
  try {
    const res = await uploadAPI.uploadImage(file)
    const data = res?.data ?? res
    const url = data?.url || data?.path || data?.local_path
    if (!url) { ElMessage.error('上传未返回地址'); return }
    form.image_url = url
    form.local_path = data?.local_path ?? null
    await api.update(form.id, { image_url: url, local_path: null })
    reloadFn()
    ElMessage.success('图片已更新')
  } catch (e) { ElMessage.error(e.message || '上传失败') }
  finally { form.imgUploading = false }
}

// 共享：AI 生成图片
async function doGenerateLibImg(form, prompt, api, reloadFn) {
  if (!prompt?.trim()) { ElMessage.warning('请先填写名称或描述'); return }
  form.imgGenerating = true
  try {
    const res = await imagesAPI.create({ prompt: prompt.trim(), drama_id: null })
    const imgData = res?.data ?? res
    const taskId = imgData?.task_id
    if (!taskId) throw new Error('未返回任务ID')
    let task = null
    for (let i = 0; i < 300; i++) {
      await new Promise(r => setTimeout(r, 1500))
      const tr = await taskAPI.get(taskId)
      task = tr?.data ?? tr
      if (task.status === 'completed') break
      if (task.status === 'failed') throw new Error(task.error || '生成失败')
    }
    if (!task || task.status !== 'completed') throw new Error('生成超时')
    const result = task.result
    const imageUrl = result?.image_url
    const localPath = result?.local_path ?? null
    if (!imageUrl && !localPath) throw new Error('未获取到图片地址')
    form.image_url = imageUrl || ''
    form.local_path = localPath
    await api.update(form.id, { image_url: imageUrl || null, local_path: localPath })
    reloadFn()
    ElMessage.success('AI 图片已生成')
  } catch (e) { ElMessage.error(e.message || '生成失败') }
  finally { form.imgGenerating = false }
}

const loading = ref(false)
const dramas = ref([])
const total = ref(0)

// 搜索与统计
const searchKeyword = ref('')
const filteredDramas = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return dramas.value
  return dramas.value.filter((d) =>
    (d.title || '').toLowerCase().includes(kw) ||
    (d.description || '').toLowerCase().includes(kw)
  )
})
const totalEpisodes = computed(() => dramas.value.reduce((sum, d) => sum + (d.episodes?.length || 0), 0))
const totalStoryboardsCount = computed(() => dramas.value.reduce((sum, d) => sum + totalStoryboards(d), 0))

// 封面占位：按项目 id 从影院色系（金/绛红/香槟/夜紫/蓝调）渐变中取色
const coverPalettes = [
  ['rgba(201, 151, 63, .17)', 'rgba(46, 28, 14, .05)'],
  ['rgba(138, 31, 43, .16)', 'rgba(40, 14, 18, .05)'],
  ['rgba(220, 174, 95, .13)', 'rgba(46, 28, 14, .04)'],
  ['rgba(155, 111, 232, .12)', 'rgba(38, 14, 18, .04)'],
  ['rgba(55, 161, 255, .10)', 'rgba(20, 24, 32, .05)'],
]
function coverStyle(d) {
  const [from, to] = coverPalettes[(d.id ?? 0) % coverPalettes.length]
  return { background: `linear-gradient(135deg, ${from}, ${to})` }
}
function coverGlyph(d) {
  return (d.title || '剧').trim().charAt(0).toUpperCase() || '剧'
}

// 海报画面：后端已按首帧逻辑解析好 cover（dramas.thumbnail），优先使用
const failedPosters = ref(new Set())
function posterImage(d) {
  if (d.thumbnail) return d.thumbnail
  // 兼容：旧数据无 thumbnail 时回退到首个有图分镜
  for (const ep of d.episodes || []) {
    for (const sb of ep.storyboards || []) {
      const u = storyboardImageUrl(sb)
      if (u) return u
    }
  }
  return ''
}
function onPosterError(d) {
  failedPosters.value.add(d.id)
}

function handleLibraryCmd(cmd) {
  if (cmd === 'char') showCharLibrary.value = true
  else if (cmd === 'scene') showSceneLibrary.value = true
  else if (cmd === 'prop') showPropLibrary.value = true
}

// 胶片画廊：精选画风缩略图（双份列表用于无缝循环滚动）
const galleryValues = [
  'cinematic', 'noir', 'retro film', 'anime style', 'sci-fi', 'cyberpunk',
  'wuxia', 'ink-wash', 'historical', 'fantasy', 'comic', 'neo-chinese-guochao',
  'watercolor', 'steampunk', 'dark-fantasy', 'korean-romance-webtoon',
]
const styleIndex = new Map(
  generationStyleOptions.flatMap((g) => g.options.map((o) => [o.value, o]))
)
const galleryFrames = galleryValues
  .map((v) => styleIndex.get(v))
  .filter((o) => o && o.thumb)
  .map((o) => ({ label: o.label, thumb: o.thumb }))
const galleryLoop = [...galleryFrames, ...galleryFrames]

// 散景光斑（影院氛围景深）
const bokehLights = [
  { left: '6%', top: '14%', size: 96, color: 'rgba(220, 174, 95, .13)' },
  { left: '20%', top: '58%', size: 140, color: 'rgba(138, 31, 43, .15)' },
  { left: '34%', top: '10%', size: 60, color: 'rgba(201, 151, 63, .12)' },
  { left: '52%', top: '70%', size: 116, color: 'rgba(201, 151, 63, .1)' },
  { left: '66%', top: '16%', size: 80, color: 'rgba(155, 111, 232, .09)' },
  { left: '78%', top: '52%', size: 128, color: 'rgba(220, 174, 95, .1)' },
  { left: '90%', top: '22%', size: 66, color: 'rgba(138, 31, 43, .12)' },
  { left: '12%', top: '80%', size: 54, color: 'rgba(201, 151, 63, .14)' },
].map((b, i) => ({
  left: b.left,
  top: b.top,
  width: b.size + 'px',
  height: b.size + 'px',
  background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
  animationDuration: (12 + i * 2.4) + 's',
  animationDelay: (-i * 1.9) + 's',
}))

// 鼠标视差（减弱动效时跳过）
const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
function onHeroMove(e) {
  if (reduceMotion) return
  const el = e.currentTarget
  const r = el.getBoundingClientRect()
  el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 2 - 1).toFixed(3))
  el.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 2 - 1).toFixed(3))
}

// 图片预览
const previewImageUrl = ref(null)
function assetImageUrl(item) {
  if (!item) return ''
  if (typeof item === 'string') return item.startsWith('http') ? item : item
  const localPath = item.local_path && String(item.local_path).trim()
  if (localPath) return '/static/' + localPath.replace(/^\//, '')
  return item.image_url || ''
}
function openImagePreview(url) {
  if (url) previewImageUrl.value = url
}

// 公共角色库
const showCharLibrary = ref(false)
const charLibraryList = ref([])
const charLibraryLoading = ref(false)
const charLibraryPage = ref(1)
const charLibraryPageSize = ref(20)
const charLibraryTotal = ref(0)
const charLibraryKeyword = ref('')
const showEditCharLibrary = ref(false)
const editCharLibraryForm = ref(null)
const editCharLibrarySaving = ref(false)
let charLibraryKeywordTimer = null

async function loadCharLibraryList() {
  charLibraryLoading.value = true
  try {
    const res = await characterLibraryAPI.list({ page: charLibraryPage.value, page_size: charLibraryPageSize.value, keyword: charLibraryKeyword.value || undefined, global: 1 })
    charLibraryList.value = res?.items ?? []
    const p = res?.pagination ?? {}
    charLibraryTotal.value = p.total ?? 0
    if (p.page != null) charLibraryPage.value = p.page
    if (p.page_size != null) charLibraryPageSize.value = p.page_size
  } catch { charLibraryList.value = [] } finally { charLibraryLoading.value = false }
}
function debouncedLoadCharLibrary() {
  if (charLibraryKeywordTimer) clearTimeout(charLibraryKeywordTimer)
  charLibraryKeywordTimer = setTimeout(() => { charLibraryPage.value = 1; loadCharLibraryList() }, 300)
}
function openEditCharLibrary(item) {
  editCharLibraryForm.value = { id: item.id, name: item.name ?? '', category: item.category ?? '', description: item.description ?? '', tags: item.tags ?? '', image_url: item.image_url ?? '', local_path: item.local_path ?? null, imgUploading: false, imgGenerating: false }
  showEditCharLibrary.value = true
}
async function submitEditCharLibrary() {
  if (!editCharLibraryForm.value?.id) return
  editCharLibrarySaving.value = true
  try {
    await characterLibraryAPI.update(editCharLibraryForm.value.id, { name: editCharLibraryForm.value.name, category: editCharLibraryForm.value.category || null, description: editCharLibraryForm.value.description || null, tags: editCharLibraryForm.value.tags || null, image_url: editCharLibraryForm.value.image_url || null, local_path: editCharLibraryForm.value.local_path ?? null })
    ElMessage.success('已保存')
    showEditCharLibrary.value = false
    loadCharLibraryList()
  } catch (e) { ElMessage.error(e.message || '保存失败') } finally { editCharLibrarySaving.value = false }
}
async function onDeleteCharLibrary(item) {
  try { await ElMessageBox.confirm(`确定删除公共角色「${(item.name || '未命名').slice(0, 20)}」吗？`, '删除确认', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }) } catch { return }
  try { await characterLibraryAPI.delete(item.id); ElMessage.success('已删除'); loadCharLibraryList() } catch (e) { ElMessage.error(e.message || '删除失败') }
}

// 公共场景库
const showSceneLibrary = ref(false)
const sceneLibraryList = ref([])
const sceneLibraryLoading = ref(false)
const sceneLibraryPage = ref(1)
const sceneLibraryPageSize = ref(20)
const sceneLibraryTotal = ref(0)
const sceneLibraryKeyword = ref('')
const showEditSceneLibrary = ref(false)
const editSceneLibraryForm = ref(null)
const editSceneLibrarySaving = ref(false)
let sceneLibraryKeywordTimer = null

async function loadSceneLibraryList() {
  sceneLibraryLoading.value = true
  try {
    const res = await sceneLibraryAPI.list({ page: sceneLibraryPage.value, page_size: sceneLibraryPageSize.value, keyword: sceneLibraryKeyword.value || undefined, global: 1 })
    sceneLibraryList.value = res?.items ?? []
    const p = res?.pagination ?? {}
    sceneLibraryTotal.value = p.total ?? 0
    if (p.page != null) sceneLibraryPage.value = p.page
    if (p.page_size != null) sceneLibraryPageSize.value = p.page_size
  } catch { sceneLibraryList.value = [] } finally { sceneLibraryLoading.value = false }
}
function debouncedLoadSceneLibrary() {
  if (sceneLibraryKeywordTimer) clearTimeout(sceneLibraryKeywordTimer)
  sceneLibraryKeywordTimer = setTimeout(() => { sceneLibraryPage.value = 1; loadSceneLibraryList() }, 300)
}
function openEditSceneLibrary(item) {
  editSceneLibraryForm.value = { id: item.id, location: item.location ?? '', time: item.time ?? '', category: item.category ?? '', description: item.description ?? '', tags: item.tags ?? '', image_url: item.image_url ?? '', local_path: item.local_path ?? null, imgUploading: false, imgGenerating: false }
  showEditSceneLibrary.value = true
}
async function submitEditSceneLibrary() {
  if (!editSceneLibraryForm.value?.id) return
  editSceneLibrarySaving.value = true
  try {
    await sceneLibraryAPI.update(editSceneLibraryForm.value.id, { location: editSceneLibraryForm.value.location, time: editSceneLibraryForm.value.time || null, category: editSceneLibraryForm.value.category || null, description: editSceneLibraryForm.value.description || null, tags: editSceneLibraryForm.value.tags || null, image_url: editSceneLibraryForm.value.image_url || null, local_path: editSceneLibraryForm.value.local_path ?? null })
    ElMessage.success('已保存')
    showEditSceneLibrary.value = false
    loadSceneLibraryList()
  } catch (e) { ElMessage.error(e.message || '保存失败') } finally { editSceneLibrarySaving.value = false }
}
async function onDeleteSceneLibrary(item) {
  const name = (item.location || item.time || '未命名').slice(0, 20)
  try { await ElMessageBox.confirm(`确定删除公共场景「${name}」吗？`, '删除确认', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }) } catch { return }
  try { await sceneLibraryAPI.delete(item.id); ElMessage.success('已删除'); loadSceneLibraryList() } catch (e) { ElMessage.error(e.message || '删除失败') }
}

// 公共道具库
const showPropLibrary = ref(false)
const propLibraryList = ref([])
const propLibraryLoading = ref(false)
const propLibraryPage = ref(1)
const propLibraryPageSize = ref(20)
const propLibraryTotal = ref(0)
const propLibraryKeyword = ref('')
const showEditPropLibrary = ref(false)
const editPropLibraryForm = ref(null)
const editPropLibrarySaving = ref(false)
let propLibraryKeywordTimer = null

async function loadPropLibraryList() {
  propLibraryLoading.value = true
  try {
    const res = await propLibraryAPI.list({ page: propLibraryPage.value, page_size: propLibraryPageSize.value, keyword: propLibraryKeyword.value || undefined, global: 1 })
    propLibraryList.value = res?.items ?? []
    const p = res?.pagination ?? {}
    propLibraryTotal.value = p.total ?? 0
    if (p.page != null) propLibraryPage.value = p.page
    if (p.page_size != null) propLibraryPageSize.value = p.page_size
  } catch { propLibraryList.value = [] } finally { propLibraryLoading.value = false }
}
function debouncedLoadPropLibrary() {
  if (propLibraryKeywordTimer) clearTimeout(propLibraryKeywordTimer)
  propLibraryKeywordTimer = setTimeout(() => { propLibraryPage.value = 1; loadPropLibraryList() }, 300)
}
function openEditPropLibrary(item) {
  editPropLibraryForm.value = { id: item.id, name: item.name ?? '', category: item.category ?? '', description: item.description ?? '', tags: item.tags ?? '', image_url: item.image_url ?? '', local_path: item.local_path ?? null, imgUploading: false, imgGenerating: false }
  showEditPropLibrary.value = true
}
async function submitEditPropLibrary() {
  if (!editPropLibraryForm.value?.id) return
  editPropLibrarySaving.value = true
  try {
    await propLibraryAPI.update(editPropLibraryForm.value.id, { name: editPropLibraryForm.value.name, category: editPropLibraryForm.value.category || null, description: editPropLibraryForm.value.description || null, tags: editPropLibraryForm.value.tags || null, image_url: editPropLibraryForm.value.image_url || null, local_path: editPropLibraryForm.value.local_path ?? null })
    ElMessage.success('已保存')
    showEditPropLibrary.value = false
    loadPropLibraryList()
  } catch (e) { ElMessage.error(e.message || '保存失败') } finally { editPropLibrarySaving.value = false }
}
async function onDeletePropLibrary(item) {
  try { await ElMessageBox.confirm(`确定删除公共道具「${(item.name || '未命名').slice(0, 20)}」吗？`, '删除确认', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }) } catch { return }
  try { await propLibraryAPI.delete(item.id); ElMessage.success('已删除'); loadPropLibraryList() } catch (e) { ElMessage.error(e.message || '删除失败') }
}

const showNewDialog = ref(false)
const newForm = ref({ title: '', description: '', aspect_ratio: '16:9' })
const newSaving = ref(false)
const exportingId = ref(null)
const importing = ref(false)
const importFileInput = ref(null)

const exampleList = ref([])
const importingExample = ref(null)

function loadExamples() {
  dramaAPI.listExamples()
    .then(res => { exampleList.value = Array.isArray(res) ? res : (res?.data ?? []) })
    .catch(() => { exampleList.value = [] })
}

async function onImportExample(ex) {
  importingExample.value = ex.filename
  try {
    const data = await dramaAPI.importExample(ex.filename)
    ElMessage.success(`示例导入成功：${data?.title || ex.name}`)
    loadList()
  } catch (e) {
    const msg = e.response?.data?.message || e.message || '导入失败'
    ElMessage.error(msg)
  } finally {
    importingExample.value = null
  }
}

const showEditDialog = ref(false)
const editForm = ref({ id: null, title: '', description: '' })
const editSaving = ref(false)

function loadList() {
  loading.value = true
  dramaAPI
    .list({ page: 1, page_size: 50 })
    .then((res) => {
      dramas.value = res?.items ?? []
      total.value = res?.pagination?.total ?? 0
    })
    .catch(() => {
      dramas.value = []
    })
    .finally(() => {
      loading.value = false
    })
}

function formatDate(val) {
  if (!val) return ''
  const d = new Date(val)
  return d.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

function formatStatus(status) {
  const map = { draft: '草稿', published: '已发布', archived: '已归档', generating: '生成中' }
  return map[status] || status || '草稿'
}

function formatStyle(style) {
  const aliases = { anime: 'anime style', sci_fi: 'sci-fi' }
  const key = aliases[style] || style
  return getStyleLabel(key)
}

function formatGenre(genre) {
  const map = { drama: '剧情', comedy: '喜剧', adventure: '冒险', romance: '爱情', thriller: '悬疑', action: '动作', horror: '恐怖' }
  return map[genre] || genre
}

function totalStoryboards(d) {
  return (d.episodes || []).reduce((sum, ep) => sum + (ep.storyboards?.length || 0), 0)
}

function goNewProject() {
  showNewDialog.value = true
}

function resetNewForm() {
  newForm.value = { title: '', description: '', aspect_ratio: '16:9' }
}

async function submitNew() {
  const title = newForm.value.title?.trim()
  if (!title) return
  newSaving.value = true
  try {
    const drama = await dramaAPI.create({ title, description: newForm.value.description?.trim() || undefined, metadata: { aspect_ratio: newForm.value.aspect_ratio || '16:9' } })
    showNewDialog.value = false
    ElMessage.success('项目已创建')
    loadList()
    router.push('/film/' + drama.id)
  } catch (e) {
    ElMessage.error(e.message || '创建失败')
  } finally {
    newSaving.value = false
  }
}

function openEditDialog(d) {
  editForm.value = { id: d.id, title: d.title || '', description: d.description || '' }
  showEditDialog.value = true
}

function resetEditForm() {
  editForm.value = { id: null, title: '', description: '' }
}

async function submitEdit() {
  const title = editForm.value.title?.trim()
  if (!title || editForm.value.id == null) return
  editSaving.value = true
  try {
    await dramaAPI.update(editForm.value.id, { title, description: editForm.value.description?.trim() || undefined })
    showEditDialog.value = false
    ElMessage.success('已保存')
    loadList()
  } catch (e) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    editSaving.value = false
  }
}

function openProject(id) {
  router.push('/drama/' + id)
}

function onExport(d) {
  if (exportingId.value) return
  exportingId.value = d.id
  try {
    // 大 ZIP 用浏览器原生下载，避免 axios blob 经 dev proxy 整包缓冲导致 ERR_FAILED
    const a = document.createElement('a')
    a.href = `/api/v1/dramas/${d.id}/export`
    a.download = `${d.title || 'drama'}.zip`
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    ElMessage.success('开始下载')
  } catch (e) {
    ElMessage.error(e.message || '导出失败')
  } finally {
    exportingId.value = null
  }
}

function triggerImport() {
  importFileInput.value?.click()
}

async function onImportFile(e) {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''
  if (!file.name.endsWith('.zip')) {
    ElMessage.error('请选择 .zip 格式的文件')
    return
  }
  importing.value = true
  try {
    const data = await dramaAPI.importDrama(file)
    ElMessage.success(`导入成功：${data?.title || '项目'}`) 
    loadList()
  } catch (e) {
    const msg = e.response?.data?.message || e.message || '导入失败'
    ElMessage.error(msg)
  } finally {
    importing.value = false
  }
}

async function onDelete(d) {
  try {
    await ElMessageBox.confirm(
      `确定要删除项目「${(d.title || '未命名').slice(0, 20)}${(d.title && d.title.length > 20) ? '…' : ''}」吗？此操作不可恢复。`,
      '删除确认',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' }
    )
  } catch {
    return
  }
  try {
    await dramaAPI.delete(d.id)
    ElMessage.success('已删除')
    loadList()
  } catch (e) {
    ElMessage.error(e.message || '删除失败')
  }
}

onMounted(() => {
  loadList()
  loadExamples()
})
</script>


<style scoped>
.film-list {
  min-height: 100vh;
  background: #090808;
  color: #e6e0d6;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(247, 243, 239, .04) 1px, transparent 0),
    radial-gradient(ellipse 70% 45% at 50% -10%, rgba(201, 151, 63,  0.09) 0%, transparent 70%),
    radial-gradient(ellipse 50% 35% at 88% 50%, rgba(220, 174, 95,  0.05) 0%, transparent 60%),
    radial-gradient(ellipse 40% 30% at 8% 85%, rgba(138, 31, 43,  0.05) 0%, transparent 60%);
  background-size: 26px 26px, auto, auto, auto;
}

/* ===================== Hero · 放映厅首映 ===================== */
.hero {
  position: relative;
  padding: 48px 24px 20px;
  min-height: min(900px, 94vh);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 22px;
  overflow: hidden;
}
/* 暗角（影院氛围） */
.hero::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(125% 95% at 50% 32%, transparent 58%, rgba(5, 4, 3, 0.55) 100%);
  pointer-events: none;
}

/* —— 巨型背景字（景深层） —— */
.hero-backdrop {
  position: absolute;
  inset: -6% 0 auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  font-size: clamp(8rem, 22vw, 20rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0.14em;
  color: transparent;
  background: linear-gradient(180deg, rgba(220, 174, 95, 0.05) 0%, rgba(220, 174, 95, 0.012) 80%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-stroke: 1px rgba(220, 174, 95, 0.075);
  user-select: none;
  pointer-events: none;
  transform: translate3d(calc(var(--mx, 0) * 22px), calc(var(--my, 0) * 12px), 0);
  transition: transform 0.6s ease-out;
}

/* —— 散景光斑（景深层） —— */
.bokeh {
  position: absolute;
  inset: 0;
  pointer-events: none;
  transform: translate3d(calc(var(--mx, 0) * -26px), calc(var(--my, 0) * -14px), 0);
  transition: transform 0.5s ease-out;
}
.bokeh span {
  position: absolute;
  border-radius: 50%;
  animation: bokeh-drift ease-in-out infinite alternate;
}
@keyframes bokeh-drift {
  from { transform: translate3d(0, 0, 0) scale(1); }
  to { transform: translate3d(28px, -22px, 0) scale(1.18); }
}

/* —— 中轴光柱（放映机主光） —— */
.godray {
  position: absolute;
  top: -22%;
  left: 50%;
  transform: translateX(-50%);
  width: 58vw;
  height: 125%;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(233, 211, 166, 0.09) 0%, rgba(233, 211, 166, 0.03) 50%, transparent 80%);
  clip-path: polygon(44% 0, 56% 0, 100% 100%, 0 100%);
  filter: blur(18px);
}

/* —— 放映光束（扫动） —— */
.beam {
  position: absolute;
  top: -30%;
  width: 46vw;
  height: 150%;
  pointer-events: none;
  background: linear-gradient(180deg, rgba(233, 211, 166, 0.12) 0%, rgba(233, 211, 166, 0.045) 45%, transparent 78%);
  clip-path: polygon(46% 0, 54% 0, 100% 100%, 0 100%);
  filter: blur(14px);
  transform-origin: top center;
}
.beam--left {
  left: -6%;
  animation: beam-pan-l 11s ease-in-out infinite alternate;
}
.beam--right {
  right: -6%;
  animation: beam-pan-r 12.5s ease-in-out infinite alternate;
}
@keyframes beam-pan-l {
  0% { transform: rotate(10deg); opacity: 0.9; }
  50% { opacity: 0.5; }
  100% { transform: rotate(18deg); opacity: 0.9; }
}
@keyframes beam-pan-r {
  0% { transform: rotate(-18deg); opacity: 0.6; }
  50% { opacity: 0.35; }
  100% { transform: rotate(-10deg); opacity: 0.6; }
}

/* —— 光束中的尘埃 —— */
.hero-dust {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.hero-dust span {
  position: absolute;
  top: 55%;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(236, 220, 186, 0.5);
  box-shadow: 0 0 6px rgba(233, 211, 166, 0.5);
  animation: dust-rise linear infinite;
  opacity: 0;
}
@keyframes dust-rise {
  0% { transform: translateY(0) scale(0.6); opacity: 0; }
  15% { opacity: 0.8; }
  85% { opacity: 0.4; }
  100% { transform: translateY(-150px) scale(1); opacity: 0; }
}

/* —— 红幕布（闭合 → 向两侧拉开收拢） —— */
.curtain-reveal {
  position: absolute;
  inset: 0;
  z-index: 6;
  pointer-events: none;
}
.reveal-half {
  position: absolute;
  top: 0;
  bottom: 0;
  /* 完成态：收紧在两侧的幕条 */
  width: 7%;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.45) 0%, transparent 22%, rgba(0, 0, 0, 0.3) 100%),
    repeating-linear-gradient(90deg, #1e070c 0px, #4d101d 14px, #6b1a28 26px, #4d101d 38px, #1e070c 52px);
  box-shadow: inset 0 0 44px rgba(0, 0, 0, 0.55);
}
/* 内沿深色接缝 */
.reveal-half--left::before,
.reveal-half--right::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.reveal-half--left::before { background: linear-gradient(90deg, transparent 62%, rgba(0, 0, 0, 0.38) 100%); }
.reveal-half--right::before { background: linear-gradient(-90deg, transparent 62%, rgba(0, 0, 0, 0.38) 100%); }
/* 底部金色流苏 */
.reveal-half::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 7px;
  height: 6px;
  background: radial-gradient(circle at 5px 0, rgba(220, 174, 95, 0.75) 2.5px, transparent 3.5px) 0 0 / 10px 6px repeat-x;
}
.reveal-half--left {
  left: 0;
  border-right: 2px solid rgba(220, 174, 95, 0.42);
  animation:
    reveal-open-l 2.3s cubic-bezier(.72, 0, .22, 1) 0.45s both,
    reveal-fabric-l 2.3s linear 0.45s both;
}
.reveal-half--right {
  right: 0;
  border-left: 2px solid rgba(220, 174, 95, 0.42);
  animation:
    reveal-open-r 2.3s cubic-bezier(.72, 0, .22, 1) 0.45s both,
    reveal-fabric-r 2.3s linear 0.45s both;
}
@keyframes reveal-open-l {
  0% { width: 53%; }
  72% { width: 6.2%; }
  100% { width: 7%; }
}
@keyframes reveal-open-r {
  0% { width: 53%; }
  72% { width: 6.2%; }
  100% { width: 7%; }
}
/* 褶皱随拉动滑移（织物收拢感） */
@keyframes reveal-fabric-l {
  from { background-position: 0 0, 0 0; }
  to { background-position: 0 0, 156px 0; }
}
@keyframes reveal-fabric-r {
  from { background-position: 0 0, 0 0; }
  to { background-position: 0 0, -156px 0; }
}

/* —— 宽银幕（四周灯泡，视差主体） —— */
.screen {
  position: relative;
  z-index: 2;
  max-width: 1120px;
  width: 100%;
  margin: 0 auto;
  border-radius: 20px;
  background:
    linear-gradient(180deg, rgba(18, 16, 15, 0.94) 0%, rgba(11, 10, 9, 0.97) 100%);
  border: 1px solid rgba(220, 174, 95, 0.22);
  box-shadow:
    0 0 0 1px rgba(201, 151, 63, 0.04),
    0 0 56px rgba(201, 151, 63, 0.07),
    0 30px 80px rgba(5, 4, 3, 0.65);
  overflow: hidden;
  transform: translate3d(calc(var(--mx, 0) * -10px), calc(var(--my, 0) * -7px), 0);
  transition: transform 0.35s ease-out;
  animation: screen-lightup 1.3s ease 1.3s both;
}
@keyframes screen-lightup {
  from { opacity: 0; filter: brightness(0.25); }
}

/* 银幕内部微光 + 胶片颗粒 */
.screen-body {
  position: relative;
  padding: 72px 56px 76px;
  text-align: center;
  background:
    radial-gradient(90% 120% at 50% 0%, rgba(201, 151, 63, 0.06) 0%, transparent 55%);
}
.screen-body::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.5;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.035 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E");
  animation: grain-jitter 1.2s steps(6) infinite;
}
@keyframes grain-jitter {
  0% { background-position: 0 0; }
  20% { background-position: -30px 10px; }
  40% { background-position: 20px -25px; }
  60% { background-position: -15px -10px; }
  80% { background-position: 25px 20px; }
  100% { background-position: 0 0; }
}

/* 放映机闪烁 */
.projector-flicker {
  position: absolute;
  inset: 0;
  pointer-events: none;
  mix-blend-mode: screen;
  background: radial-gradient(80% 60% at 50% 40%, rgba(255, 244, 214, 0.05), transparent 72%);
  animation: flicker 3.8s steps(12) infinite;
}
@keyframes flicker {
  0%, 100% { opacity: 0.5; }
  8% { opacity: 0.95; }
  16% { opacity: 0.4; }
  30% { opacity: 0.85; }
  44% { opacity: 0.55; }
  58% { opacity: 1; }
  72% { opacity: 0.45; }
  86% { opacity: 0.8; }
}

/* —— 跑马灯泡（四周追逐） —— */
.bulb-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 18px 0;
}
.bulb-row:last-child {
  padding: 0 18px 10px;
}
.bulb {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 35%, #f4e3bd, #dcae5f);
  animation: bulb-chase 1.7s ease-in-out infinite;
}
@keyframes bulb-chase {
  0%, 100% {
    opacity: 0.28;
    box-shadow: 0 0 3px rgba(224, 178, 100, 0.25);
  }
  50% {
    opacity: 1;
    box-shadow: 0 0 9px rgba(224, 178, 100, 0.85), 0 0 18px rgba(201, 151, 63, 0.4);
  }
}

/* —— 银幕文案（逐行浮现） —— */
.hero-eyebrow {
  margin: 0 0 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  font-size: 0.84rem;
  font-weight: 600;
  letter-spacing: 0.26em;
  color: #dcae5f;
  text-transform: uppercase;
  animation: rise-in 0.7s var(--ease-out) 1.7s both;
}
.hero-eyebrow::before,
.hero-eyebrow::after {
  content: '';
  width: 64px;
  height: 1px;
}
.hero-eyebrow::before { background: linear-gradient(90deg, transparent, rgba(220, 174, 95, 0.55)); }
.hero-eyebrow::after { background: linear-gradient(-90deg, transparent, rgba(220, 174, 95, 0.55)); }
.eyebrow-star {
  color: rgba(220, 174, 95, 0.65);
  font-size: 0.7rem;
  vertical-align: 1px;
}
.hero-title {
  margin: 0 0 14px;
  font-size: clamp(2.8rem, 6.5vw, 4.4rem);
  font-weight: 900;
  letter-spacing: -0.015em;
  line-height: 1.12;
  background: linear-gradient(146deg, #f5e6c4 0.67%, #c9973f 99.57%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 0 20px rgba(201, 151, 63, 0.22));
  animation:
    rise-in 0.8s var(--ease-out) 1.85s both,
    title-glow 4.5s ease-in-out 3s infinite;
}
@keyframes title-glow {
  0%, 100% { filter: drop-shadow(0 0 20px rgba(201, 151, 63, 0.2)); }
  50% { filter: drop-shadow(0 0 30px rgba(201, 151, 63, 0.34)); }
}
.hero-billing {
  margin: 2px 0 16px;
  font-size: 0.72rem;
  font-weight: 500;
  letter-spacing: 0.46em;
  text-indent: 0.46em;
  color: rgba(220, 174, 95, 0.55);
  text-transform: uppercase;
  animation: rise-in 0.7s var(--ease-out) 1.95s both;
}
.hero-credits {
  margin-top: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  color: #8b8478;
  animation: rise-in 0.7s var(--ease-out) 2.35s both;
}
.hero-credits i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: rgba(220, 174, 95, 0.5);
}
.hero-sub {
  margin: 0 auto 28px;
  font-size: 0.98rem;
  color: #b3aca0;
  max-width: 520px;
  animation: rise-in 0.7s var(--ease-out) 2s both;
}
.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  animation: rise-in 0.7s var(--ease-out) 2.15s both;
}
@keyframes rise-in {
  from { opacity: 0; transform: translateY(20px); }
}
.hero-btn-import {
  --el-button-bg-color: rgba(201, 151, 63, 0.1);
  --el-button-border-color: rgba(201, 151, 63, 0.32);
  --el-button-text-color: #dcae5f;
  --el-button-hover-bg-color: rgba(201, 151, 63, 0.2);
  --el-button-hover-border-color: rgba(201, 151, 63, 0.5);
  --el-button-hover-text-color: #ecc98f;
}

/* —— 银幕地面光晕（舞台反光） —— */
.screen-reflection {
  width: 72%;
  max-width: 900px;
  height: 64px;
  margin: -6px auto 0;
  background: radial-gradient(56% 100% at 50% 0%, rgba(201, 151, 63, 0.1) 0%, rgba(138, 31, 43, 0.04) 45%, transparent 78%);
  filter: blur(4px);
  pointer-events: none;
}

/* —— 票根统计（末位入场） —— */
.ticket-row {
  position: relative;
  max-width: 980px;
  margin: 0 auto;
  width: 100%;
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  z-index: 2;
  animation: rise-in 0.8s var(--ease-out) 2.4s both;
}
.ticket {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 210px;
  padding: 16px 24px 16px 18px;
  border-radius: 12px;
  background:
    radial-gradient(circle at 0 0, rgba(201, 151, 63, 0.12) 0%, transparent 70%),
    linear-gradient(135deg, #f7f2ec 0%, #efe6db 100%);
  color: #4a3527;
  box-shadow: 0 10px 30px rgba(5, 4, 3, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.6);
  position: relative;
  transform: rotate(-0.6deg);
  transition: transform 0.25s var(--ease-out), box-shadow 0.25s;
}
.ticket:nth-child(2) { transform: rotate(0.7deg); }
.ticket:nth-child(3) { transform: rotate(-0.4deg); }
.ticket:hover {
  transform: rotate(0deg) translateY(-3px);
  box-shadow: 0 16px 40px rgba(5, 4, 3, 0.55), 0 0 0 1px rgba(201, 151, 63, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6);
}
/* 票根穿孔（左右半圆缺口 + 中缝虚线） */
.ticket::before,
.ticket::after {
  content: '';
  position: absolute;
  right: 62px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #090808;
}
.ticket::before { top: -7px; }
.ticket::after { bottom: -7px; }
.ticket-num {
  font-size: 1.9rem;
  font-weight: 900;
  line-height: 1;
  color: #8a1f2b;
  font-variant-numeric: tabular-nums;
}
.ticket-info {
  border-left: 2px dashed rgba(74, 53, 39, 0.3);
  padding-left: 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.ticket-info b {
  font-size: 0.95rem;
  font-weight: 700;
  color: #2c1b10;
}
.ticket-info span {
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  color: #9a6a4a;
  text-transform: uppercase;
}

/* ===================== 工具行 ===================== */
.main {
  max-width: min(1400px, 96vw);
  margin: 0 auto;
  padding: 28px 16px 56px;
}

/* 胶片画廊（风格卷轴，无限滚动） */
.reel-gallery {
  position: relative;
  margin-bottom: 22px;
  padding: 21px 0;
  background: #12100e;
  border-top: 1px solid rgba(240, 234, 226, 0.07);
  border-bottom: 1px solid rgba(240, 234, 226, 0.07);
  overflow: hidden;
  -webkit-mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
  mask-image: linear-gradient(90deg, transparent, #000 5%, #000 95%, transparent);
}
/* 上下齿孔带 */
.reel-gallery::before,
.reel-gallery::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  height: 12px;
  background: radial-gradient(circle at 7px 6px, rgba(9, 8, 8, 0.95) 2.6px, transparent 3.4px) 0 0 / 14px 12px repeat-x;
  z-index: 1;
}
.reel-gallery::before { top: 4px; }
.reel-gallery::after { bottom: 4px; }
.reel-track {
  display: flex;
  width: max-content;
  animation: reel-scroll 48s linear infinite;
}
.reel-gallery:hover .reel-track { animation-play-state: paused; }
@keyframes reel-scroll { to { transform: translateX(-50%); } }
.reel-frame {
  position: relative;
  width: 150px;
  aspect-ratio: 16 / 9;
  margin-right: 10px;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid rgba(240, 234, 226, 0.1);
  flex-shrink: 0;
}
.reel-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: saturate(0.85) contrast(0.96);
  transition: filter 0.3s, transform 0.3s var(--ease-out, ease);
}
.reel-frame:hover img { filter: saturate(1.08); transform: scale(1.06); }
.reel-frame-label {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 12px 6px 3px;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: #f5efe5;
  background: linear-gradient(180deg, transparent, rgba(5, 4, 3, 0.85));
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===================== 正在上映 · 排片行 ===================== */
.now-showing {
  margin-bottom: 22px;
}
.ns-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding-bottom: 14px;
}
.ns-title-group {
  display: flex;
  align-items: baseline;
  gap: 12px;
  min-width: 0;
}
.ns-eyebrow {
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.3em;
  color: rgba(220, 174, 95, 0.75);
  text-transform: uppercase;
}
.ns-title {
  margin: 0;
  font-size: 1.7rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  line-height: 1.15;
  background: linear-gradient(146deg, #f5e6c4 0%, #c9973f 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.ns-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 22px;
  padding: 0 7px;
  border-radius: 99px;
  background: rgba(201, 151, 63, 0.14);
  color: #ecc98f;
  font-size: 0.78rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  align-self: center;
}
/* 分隔金线（末端菱形） */
.ns-rule {
  height: 1px;
  background: linear-gradient(90deg, rgba(220, 174, 95, 0.5), rgba(220, 174, 95, 0.12) 70%, transparent);
  position: relative;
}
.ns-rule i {
  position: absolute;
  left: 0;
  top: 50%;
  width: 7px;
  height: 7px;
  transform: translateY(-50%) rotate(45deg);
  background: linear-gradient(135deg, #ecc98f, #c9973f);
  border-radius: 1.5px;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.toolbar-search {
  width: 240px;
}

/* 资源库按钮 —— 影院金 */
.btn-library {
  --el-button-bg-color: rgba(201, 151, 63, 0.12);
  --el-button-border-color: rgba(201, 151, 63, 0.35);
  --el-button-text-color: #dcae5f;
  --el-button-hover-bg-color: rgba(201, 151, 63, 0.22);
  --el-button-hover-border-color: rgba(201, 151, 63, 0.55);
  --el-button-hover-text-color: #ecc98f;
  --el-button-active-bg-color: rgba(201, 151, 63, 0.3);
  --el-button-active-border-color: rgba(201, 151, 63, 0.7);
}
html.light .btn-library {
  --el-button-bg-color: rgba(201, 151, 63, 0.06);
  --el-button-border-color: rgba(201, 151, 63, 0.3);
  --el-button-text-color: #8c6425;
  --el-button-hover-bg-color: rgba(201, 151, 63, 0.12);
  --el-button-hover-border-color: rgba(201, 151, 63, 0.5);
  --el-button-hover-text-color: #6f4f1c;
  --el-button-active-bg-color: rgba(201, 151, 63, 0.18);
  --el-button-active-border-color: rgba(201, 151, 63, 0.65);
}

/* ===================== 海报墙 ===================== */
.projects-wrap {
  min-height: 200px;
}
.poster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(216px, 1fr));
  gap: 18px;
  align-items: stretch;
}

/* 海报卡 */
.poster-card {
  position: relative;
  border-radius: 14px;
  cursor: pointer;
  transition: transform 0.24s var(--ease-out, ease), box-shadow 0.24s;
}
.poster-card:focus-visible {
  outline: 2px solid rgba(220, 174, 95, 0.7);
  outline-offset: 2px;
}
.poster-card:hover {
  transform: translateY(-4px);
}
.poster-media {
  position: relative;
  aspect-ratio: 3 / 4;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(220, 174, 95, 0.18);
  box-shadow: inset 0 0 0 1px rgba(240, 234, 226, 0.03), 0 10px 30px rgba(5, 4, 3, 0.4);
  transition: border-color 0.24s, box-shadow 0.24s;
}
.poster-card:hover .poster-media {
  border-color: rgba(220, 174, 95, 0.55);
  box-shadow: inset 0 0 0 1px rgba(240, 234, 226, 0.04), 0 18px 44px rgba(5, 4, 3, 0.5), 0 0 26px rgba(201, 151, 63, 0.12);
}
/* 封面图 */
.poster-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: saturate(0.95);
  transition: transform 0.5s var(--ease-out, ease), filter 0.4s;
}
.poster-card:hover .poster-img {
  transform: scale(1.05);
  filter: saturate(1.05);
}
/* 无图回退：字牌 */
.poster-glyph {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4.6rem;
  font-weight: 900;
  line-height: 1;
  background: linear-gradient(146deg, #f5e6c4 0.67%, #c9973f 99.57%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  opacity: 0.85;
  user-select: none;
  filter: drop-shadow(0 4px 18px rgba(201, 151, 63, 0.22));
}
/* 底部信息（叠在画面上） */
.poster-overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 34px 14px 12px;
  background: linear-gradient(180deg, transparent, rgba(5, 4, 3, 0.55) 42%, rgba(5, 4, 3, 0.88));
}
.poster-title {
  margin: 0 0 3px;
  font-size: 1rem;
  font-weight: 700;
  color: #f5efe5;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
}
.poster-sub {
  margin: 0;
  font-size: 0.72rem;
  color: rgba(236, 201, 143, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/* 状态角标 */
.poster-status {
  display: inline-block;
  font-size: 0.62rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  padding: 1px 7px;
  margin-bottom: 6px;
  border-radius: 3px;
  color: #ecc98f;
  background: rgba(5, 4, 3, 0.55);
  border: 1px solid rgba(220, 174, 95, 0.4);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}
.poster-status--published {
  color: #6ee7b7;
  border-color: rgba(76, 175, 80, 0.45);
}
.poster-status--generating {
  color: #fcd34d;
  border-color: rgba(234, 179, 8, 0.45);
}
/* hover 操作 */
.poster-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 6px;
  opacity: 0;
  transform: translateY(-4px);
  transition: opacity 0.2s var(--ease-out, ease), transform 0.2s var(--ease-out, ease);
}
.poster-card:hover .poster-actions,
.poster-card:focus-within .poster-actions {
  opacity: 1;
  transform: translateY(0);
}
.poster-actions .el-button {
  --el-button-size: 28px;
  padding: 0;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

/* 新建 / 导入（电影引片卡） */
.poster-card--new {
  min-height: 100%;
  border-radius: 14px;
  border: 1.5px dashed rgba(220, 174, 95, 0.35);
  background: linear-gradient(160deg, rgba(201, 151, 63, 0.05), rgba(138, 31, 43, 0.04));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  padding: 20px;
  transition: border-color 0.22s, background 0.22s, transform 0.24s var(--ease-out, ease), box-shadow 0.22s;
}
.poster-card--new:hover {
  border-color: rgba(220, 174, 95, 0.65);
  background: linear-gradient(160deg, rgba(201, 151, 63, 0.1), rgba(138, 31, 43, 0.07));
  transform: translateY(-3px);
  box-shadow: 0 12px 34px rgba(5, 4, 3, 0.4);
}
.new-card-text {
  font-size: 0.86rem;
  font-weight: 500;
  color: #dcae5f;
}

/* 电影引片圆环 */
.leader-circle {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: 2px solid rgba(220, 174, 95, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  color: #ecc98f;
  transition: transform 0.22s var(--ease-out, ease), border-color 0.22s;
}
.leader-circle .el-icon { font-size: 22px; color: #ecc98f; }
.leader-circle::before {
  content: '';
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 1px solid rgba(220, 174, 95, 0.3);
}
.leader-circle::after {
  content: '';
  position: absolute;
  inset: -10px;
  background:
    linear-gradient(#c9973f, #c9973f) center / 100% 1px no-repeat,
    linear-gradient(#c9973f, #c9973f) center / 1px 100% no-repeat;
  opacity: 0.2;
}
.poster-card--new:hover .leader-circle {
  transform: scale(1.08);
  border-color: rgba(220, 174, 95, 0.8);
}
.leader-circle.is-loading .el-icon.is-turning {
  animation: leader-spin 1s linear infinite;
}
@keyframes leader-spin { to { transform: rotate(360deg); } }

/* 空态 */
.empty {
  text-align: center;
  padding: 48px 24px;
}
.empty-illust {
  width: 120px;
  height: 100px;
  display: block;
  margin: 0 auto 16px;
}
.empty-title {
  font-size: 1.05rem;
  color: #e6e0d6;
  margin: 0 0 8px;
}
.empty-desc {
  color: #8b8478;
  font-size: 0.9rem;
  margin: 0;
}

/* 新手试映 */
.example-section {
  margin-top: 28px;
  padding: 18px 20px;
  border: 1px dashed rgba(240, 234, 226, 0.12);
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.example-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}
.example-hint-icon {
  color: #dcae5f;
  font-size: 15px;
}
.example-hint-text {
  font-size: 0.8rem;
  color: #8b8478;
}
.example-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.example-btn {
  --el-button-bg-color: rgba(34, 197, 94, 0.1);
  --el-button-border-color: rgba(34, 197, 94, 0.3);
  --el-button-text-color: #4ade80;
  --el-button-hover-bg-color: rgba(34, 197, 94, 0.2);
  --el-button-hover-border-color: rgba(34, 197, 94, 0.5);
  --el-button-hover-text-color: #22c55e;
}

/* ===================== 公共库弹窗 ===================== */
:global(.library-dialog .el-dialog__body) { padding-top: 8px; }

.lib-img-editor { display: flex; align-items: center; gap: 14px; }
.lib-img-thumb { width: 88px; height: 88px; border-radius: 8px; overflow: hidden; cursor: zoom-in; background: var(--bg-inner, #1b1917); border: 1px solid var(--border-color, #2b2825); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.lib-img-thumb img { width: 100%; height: 100%; object-fit: cover; }
.lib-img-empty { color: var(--text-faint, #6b665e); font-size: 26px; }
.lib-img-btns { display: flex; flex-direction: column; gap: 8px; }
.library-toolbar { margin-bottom: 12px; }
.library-list {
  min-height: 200px;
  max-height: 420px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.library-item {
  display: flex;
  gap: 12px;
  padding: 10px;
  background: #1b1917;
  border: 1px solid #2b2825;
  border-radius: 8px;
}
.library-item-cover {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 6px;
  overflow: hidden;
  background: #2b2825;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.library-item-cover img { width: 100%; height: 100%; object-fit: cover; }
.library-item-placeholder { font-size: 0.8rem; color: #8b8478; }
.library-item-info { flex: 1; min-width: 0; }
.library-item-name { font-weight: 500; margin-bottom: 4px; color: #f5efe5; }
.library-item-desc { font-size: 0.85rem; color: #b3aca0; margin-bottom: 8px; }
.library-item-actions { display: flex; gap: 8px; }
.library-empty { text-align: center; color: #8b8478; padding: 40px 20px; }
.library-pagination { margin-top: 12px; display: flex; justify-content: center; }

/* ===================== 亮色模式适配 ===================== */
html.light .film-list {
  background: #f6f3ef;
  color: #2c1b10;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(43, 35, 24, 0.045) 1px, transparent 0),
    radial-gradient(ellipse 70% 45% at 50% -10%, rgba(201, 151, 63,  0.09) 0%, transparent 70%),
    radial-gradient(ellipse 50% 35% at 88% 50%, rgba(220, 174, 95,  0.05) 0%, transparent 60%);
  background-size: 26px 26px, auto, auto;
}
html.light .hero-eyebrow { color: #8c6425; }
html.light .eyebrow-star { color: rgba(140, 100, 37,  0.55); }
html.light .hero-title { filter: none; animation: none; }
html.light .hero-sub { color: #6b665e; }
html.light .hero::after {
  background: radial-gradient(120% 90% at 50% 30%, transparent 60%, rgba(43, 35, 24, 0.12) 100%);
}
html.light .hero-btn-import {
  --el-button-bg-color: rgba(201, 151, 63,  0.06);
  --el-button-border-color: rgba(201, 151, 63,  0.3);
  --el-button-text-color: #8c6425;
  --el-button-hover-bg-color: rgba(201, 151, 63,  0.12);
  --el-button-hover-border-color: rgba(201, 151, 63,  0.5);
  --el-button-hover-text-color: #7a5a1f;
}
/* 银幕（亮色：米白幕布） */
html.light .screen {
  background: linear-gradient(180deg, #ffffff 0%, #f7f2ec 100%);
  border-color: rgba(220, 174, 95, 0.3);
  box-shadow: 0 0 0 1px rgba(201, 151, 63, 0.06), 0 0 56px rgba(201, 151, 63, 0.07), 0 30px 70px rgba(43, 35, 24, 0.12);
}
html.light .screen-body {
  background: radial-gradient(90% 120% at 50% 0%, rgba(201, 151, 63, 0.05) 0%, transparent 55%);
}
html.light .screen-body::after { opacity: 0.35; }
html.light .hero-backdrop { -webkit-text-stroke-color: rgba(140, 100, 37, 0.09); }
html.light .bokeh { opacity: 0.6; }
/* 光束与幕布（亮色弱化） */
html.light .beam { opacity: 0.45; }
html.light .reveal-half { opacity: 0.9; }
/* 票根（亮色：保持纸感，穿孔颜色跟随底色） */
html.light .ticket::before,
html.light .ticket::after { background: #f6f3ef; }
html.light .ticket-row { margin-top: 18px; }
/* 胶片分隔带（亮色） */
html.light .reel-gallery {
  background: #efe8e0;
  border-color: #e0d7cb;
}
html.light .reel-gallery::before,
html.light .reel-gallery::after {
  background-image: radial-gradient(circle at 7px 6px, rgba(120, 106, 88, 0.4) 2.6px, transparent 3.4px);
}
html.light .reel-frame { border-color: #d5cdc0; }
html.light .reel-frame-label { color: #2c1b10; background: linear-gradient(180deg, transparent, rgba(246, 243, 239, 0.92)); }
html.light .leader-circle .el-icon { color: #8c6425; }
html.light .frame-no { color: rgba(140, 100, 37, 0.8); }
html.light .marquee {
  background: linear-gradient(180deg, #ffffff 0%, #f9f5ef 100%);
  border-color: rgba(201, 151, 63, 0.3);
  box-shadow: inset 0 0 0 1px rgba(43, 35, 24, 0.03), 0 16px 40px rgba(43, 35, 24, 0.1);
}
html.light .marquee-bar {
  background: radial-gradient(90% 140% at 50% 0%, rgba(201, 151, 63, 0.05), transparent 62%);
  border-block-color: rgba(201, 151, 63, 0.2);
}
html.light .marquee-title-text { filter: none; }
html.light .ticket-tear::before,
html.light .ticket-tear::after { background: #fdfaf6; box-shadow: inset 0 1px 2px rgba(43, 35, 24, 0.15); }
html.light .project-card-body { background: linear-gradient(180deg, rgba(246, 243, 239, 0.6), transparent 60%); }
html.light .toolbar-title-sub { color: #a39c91; }
html.light .toolbar-count {
  background: rgba(201, 151, 63,  0.1);
  color: #8c6425;
}
html.light .project-card {
  background: #ffffff;
  border-color: #e5ded4;
  box-shadow: 0 1px 4px rgba(43, 35, 24, 0.05), 0 2px 12px rgba(43, 35, 24, 0.04);
}
html.light .project-card:hover {
  border-color: rgba(201, 151, 63,  0.5);
  background: #ffffff;
  box-shadow: 0 12px 36px rgba(201, 151, 63,  0.12), 0 2px 8px rgba(43, 35, 24, 0.06);
}
html.light .project-cover { border-bottom-color: #ece6de; }
html.light .project-title { color: #1a1715; }
html.light .project-desc { color: #6b665e; }
html.light .project-meta { color: #7d766c; }
html.light .new-card {
  background: linear-gradient(135deg, rgba(201, 151, 63,  0.05) 0%, rgba(220, 174, 95,  0.03) 100%);
  border-color: rgba(201, 151, 63,  0.32);
}
html.light .new-card:hover {
  background: linear-gradient(135deg, rgba(201, 151, 63,  0.09) 0%, rgba(220, 174, 95,  0.06) 100%);
  border-color: rgba(201, 151, 63,  0.5);
}
html.light .leader-circle { border-color: rgba(140, 100, 37, 0.5); color: #8c6425; }
html.light .new-card-text { color: #8c6425; }
html.light .example-section { border-color: #d5cdc0; }
html.light .example-hint-icon { color: #ab7c30; }
html.light .example-hint-text { color: #7d766c; }
html.light .empty-title { color: #2c1b10; }
html.light .empty-desc { color: #7d766c; }
html.light .library-item {
  background: #fdfaf6;
  border-color: #e7e2da;
}
html.light .library-item-name { color: #2c1b10; }
html.light .library-item-desc { color: #6b665e; }
html.light .library-empty { color: #7d766c; }
html.light .lib-img-thumb {
  background: #f3efe9;
  border-color: #e7e2da;
}
html.light .lib-img-empty { color: #a8a29a; }
html.light .badge-status--draft {
  background: rgba(125, 118, 108, 0.12);
  color: #6b665e;
  border-color: rgba(125, 118, 108, 0.3);
}

/* ===================== 图片放大预览 ===================== */
.image-preview-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  cursor: zoom-out;
}
.image-preview-img {
  max-width: 90vw;
  max-height: 90vh;
  border-radius: 8px;
  object-fit: contain;
}

@media (max-width: 768px) {
  .hero { padding-top: 32px; min-height: 0; }
  .hero-backdrop { font-size: clamp(4rem, 22vw, 8rem); }
  .hero-dust span:nth-child(n+8) { display: none; }
  .bokeh span:nth-child(n+6) { display: none; }
  .screen-body { padding: 44px 20px 48px; }
  .hero-billing { font-size: 0.62rem; letter-spacing: 0.3em; text-indent: 0.3em; }
  .hero-credits { gap: 8px; font-size: 0.66rem; }
  .hero-eyebrow::before,
  .hero-eyebrow::after { width: 28px; }
  .screen-reflection { height: 36px; }
  .bulb-row { padding: 8px 10px 0; }
  .bulb-row:last-child { padding: 0 10px 8px; }
  .bulb-row .bulb:nth-child(n+13) { display: none; }
  .ticket-row { gap: 10px; }
  .ticket { min-width: 150px; padding: 10px 14px 10px 12px; gap: 10px; }
  .ticket-num { font-size: 1.3rem; }
  .marquee-bar { padding: 8px 12px; }
  .marquee-bulbs .bulb:nth-child(n+15) { display: none; }
  .marquee-title-text { font-size: 1.2rem; }
  .project-grid { grid-template-columns: repeat(auto-fill, minmax(168px, 1fr)); gap: 14px; }
  .cover-glyph { font-size: 3.6rem; }
  .toolbar-search { width: 100%; flex: 1; }
  .toolbar-actions { width: 100%; }
  .reel-frame { width: 118px; margin-right: 8px; }
  .reel-gallery { padding: 17px 0; }
}

/* 动效减弱：停用开场序列与循环光效 */
@media (prefers-reduced-motion: reduce) {
  .reveal-half--left,
  .reveal-half--right,
  .screen,
  .hero-eyebrow,
  .hero-billing,
  .hero-credits,
  .hero-title,
  .hero-sub,
  .hero-actions,
  .ticket-row,
  .beam--left,
  .beam--right,
  .hero-dust span,
  .bulb,
  .screen-body::after,
  .projector-flicker,
  .reel-track,
  .reel-icon,
  .leader-circle .el-icon.is-turning,
  .bokeh span {
    animation: none !important;
  }
  .hero-dust span { opacity: 0.4; }
  .projector-flicker { opacity: 0.4; }
  .screen,
  .hero-backdrop,
  .bokeh { transform: none; transition: none; }
  .project-cover::before {
    transition: none;
  }
}
</style>
