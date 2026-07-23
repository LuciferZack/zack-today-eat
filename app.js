const STORAGE_KEY = "mealDecisionPickerRoomStateV3";
const LEGACY_STORAGE_KEY = "mealDecisionPickerRoomStateV2";
const NEW_MEMBER_VALUE = "__new_member__";
const ADMIN_PASSWORD = "1";
const ADMIN_SESSION_KEY = "mealDecisionPickerAdminUnlocked";
const CLOUD_TABLE_NAME = "app_state";
const CLOUD_ROW_ID = "global";
const CLOUD_SAVE_DELAY_MS = 600;
const CLOUD_POLL_INTERVAL_MS = 5000;

const defaultFoodOptions = [
  { id: "hotpot", name: "火锅", tags: ["聚餐", "辣", "牛羊肉"] },
  { id: "bbq", name: "烤肉", tags: ["聚餐", "肉类", "重口"] },
  { id: "sushi", name: "寿司", tags: ["日料", "海鲜", "清爽"] },
  { id: "malatang", name: "麻辣烫", tags: ["辣", "汤", "自选"] },
  { id: "pizza", name: "披萨", tags: ["芝士", "快餐", "分享"] },
  { id: "fried-chicken", name: "炸鸡", tags: ["快餐", "肉类", "香脆"] },
  { id: "curry-rice", name: "咖喱饭", tags: ["米饭", "鸡肉", "饱腹"] },
  { id: "noodles", name: "牛肉面", tags: ["面食", "牛肉", "热乎"] },
  { id: "dumplings", name: "饺子", tags: ["面食", "猪肉", "热乎"] },
  { id: "salad", name: "沙拉碗", tags: ["轻食", "素食", "清爽"] },
  { id: "cantonese", name: "粤菜", tags: ["清淡", "米饭", "聚餐"] },
  { id: "thai", name: "泰餐", tags: ["酸辣", "咖喱", "海鲜"] },
  { id: "burger", name: "汉堡", tags: ["快餐", "牛肉", "芝士"] },
  { id: "ramen", name: "拉面", tags: ["日料", "面食", "热乎"] },
  { id: "veggie", name: "素食简餐", tags: ["素食", "轻食", "清淡"] },
];

const chartColors = [
  "#19735f",
  "#d8583f",
  "#4267a6",
  "#d99b23",
  "#7a4fb4",
  "#25869a",
  "#b75a30",
  "#5c6b2e",
  "#c04c7b",
  "#476a52",
  "#9d5d16",
  "#5376b7",
];

const defaultState = {
  activeRoomId: "8888",
  activeAdminRoomId: "8888",
  rooms: [
    {
      id: "8888",
      name: "8888",
      foods: cloneDefaultFoods(),
      members: [
        { id: "m-1", name: "小林", wants: ["bbq", "hotpot"], avoids: ["sushi"] },
        { id: "m-2", name: "阿岚", wants: ["curry-rice", "thai"], avoids: ["hotpot", "malatang"] },
      ],
      currentPick: null,
      history: [],
      createdAt: "2026-07-23T00:00:00.000Z",
      updatedAt: "2026-07-23T00:00:00.000Z",
    },
    {
      id: "2026",
      name: "2026",
      foods: cloneDefaultFoods(),
      members: [],
      currentPick: null,
      history: [],
      createdAt: "2026-07-23T00:00:00.000Z",
      updatedAt: "2026-07-23T00:00:00.000Z",
    },
  ],
};

let state = loadState();
let cloudClient = createSupabaseClient();
let cloudReady = false;
let cloudSaveTimer = null;
let cloudPollTimer = null;
let isApplyingRemoteState = false;
let hasQueuedCloudSave = false;
let lastCloudUpdatedAt = "";

const elements = {
  syncStatus: document.querySelector("#syncStatus"),
  resultName: document.querySelector("#resultName"),
  resultMeta: document.querySelector("#resultMeta"),
  primaryActionButton: document.querySelector("#primaryActionButton"),
  copyRoomLinkButton: document.querySelector("#copyRoomLinkButton"),
  copyRoomLinkInlineButton: document.querySelector("#copyRoomLinkInlineButton"),
  roomCount: document.querySelector("#roomCount"),
  memberCount: document.querySelector("#memberCount"),
  finalCount: document.querySelector("#finalCount"),
  blockedCount: document.querySelector("#blockedCount"),
  entryView: document.querySelector("#entryView"),
  roomView: document.querySelector("#roomView"),
  resultView: document.querySelector("#resultView"),
  adminView: document.querySelector("#adminView"),
  adminLoginPanel: document.querySelector("#adminLoginPanel"),
  adminContent: document.querySelector("#adminContent"),
  adminPasswordForm: document.querySelector("#adminPasswordForm"),
  adminPasswordInput: document.querySelector("#adminPasswordInput"),
  adminPasswordMessage: document.querySelector("#adminPasswordMessage"),
  userEntryLink: document.querySelector("#userEntryLink"),
  adminEntryLink: document.querySelector("#adminEntryLink"),
  roomCodeForm: document.querySelector("#roomCodeForm"),
  roomCodeInput: document.querySelector("#roomCodeInput"),
  quickRoomList: document.querySelector("#quickRoomList"),
  roomTitle: document.querySelector("#roomTitle"),
  backToEntryFromRoom: document.querySelector("#backToEntryFromRoom"),
  preferenceForm: document.querySelector("#preferenceForm"),
  memberSelect: document.querySelector("#memberSelect"),
  newMemberField: document.querySelector("#newMemberField"),
  memberNameInput: document.querySelector("#memberNameInput"),
  foodPoolForm: document.querySelector("#foodPoolForm"),
  foodNameInput: document.querySelector("#foodNameInput"),
  foodTagsInput: document.querySelector("#foodTagsInput"),
  roomFoodList: document.querySelector("#roomFoodList"),
  wantOptions: document.querySelector("#wantOptions"),
  avoidOptions: document.querySelector("#avoidOptions"),
  wantSummary: document.querySelector("#wantSummary"),
  avoidSummary: document.querySelector("#avoidSummary"),
  wantMenu: document.querySelector("#wantMenu"),
  avoidMenu: document.querySelector("#avoidMenu"),
  formMessage: document.querySelector("#formMessage"),
  memberList: document.querySelector("#memberList"),
  resultRoomTitle: document.querySelector("#resultRoomTitle"),
  editMyChoiceLink: document.querySelector("#editMyChoiceLink"),
  wantChart: document.querySelector("#wantChart"),
  avoidChart: document.querySelector("#avoidChart"),
  wantChartTotal: document.querySelector("#wantChartTotal"),
  avoidChartTotal: document.querySelector("#avoidChartTotal"),
  statusFilter: document.querySelector("#statusFilter"),
  drawButton: document.querySelector("#drawButton"),
  foodList: document.querySelector("#foodList"),
  clearHistoryButton: document.querySelector("#clearHistoryButton"),
  historyList: document.querySelector("#historyList"),
  adminRoomList: document.querySelector("#adminRoomList"),
  adminDetailTitle: document.querySelector("#adminDetailTitle"),
  adminDetail: document.querySelector("#adminDetail"),
  exportDataButton: document.querySelector("#exportDataButton"),
  adminLogoutButton: document.querySelector("#adminLogoutButton"),
};

route();
hydrateCloudState();

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!saved) return cloneDefaultState();
    return normalizeState(JSON.parse(saved));
  } catch {
    return cloneDefaultState();
  }
}

function normalizeState(parsed) {
  if (!parsed || !Array.isArray(parsed.rooms)) {
    return cloneDefaultState();
  }

  const rooms = parsed.rooms
    .map((room) => normalizeRoomObject(room))
    .filter((room) => room.id);

  const activeRoomId = rooms.some((room) => room.id === parsed.activeRoomId)
    ? parsed.activeRoomId
    : rooms[0]?.id || "";
  const activeAdminRoomId = rooms.some((room) => room.id === parsed.activeAdminRoomId)
    ? parsed.activeAdminRoomId
    : activeRoomId;

  return { activeRoomId, activeAdminRoomId, rooms };
}

function normalizeRoomObject(room, fallbackId = "") {
  const id = normalizeRoomCode(room?.id || room?.name || fallbackId);
  if (!id) return null;
  const foods = normalizeFoods(room?.foods);
  return {
    id,
    name: id,
    foods,
    members: Array.isArray(room?.members)
      ? room.members.map((member) => ({
          id: String(member.id || createId("m")),
          name: String(member.name || "未命名"),
          wants: cleanOptionIds(member.wants, foods),
          avoids: cleanOptionIds(member.avoids, foods),
        }))
      : [],
    currentPick: room?.currentPick || null,
    history: Array.isArray(room?.history) ? room.history : [],
    createdAt: room?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function cloneDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function cloneDefaultFoods() {
  return defaultFoodOptions.map((food) => ({
    ...food,
    tags: [...food.tags],
  }));
}

function saveState() {
  saveLocalState();
  if (cloudClient && (!cloudReady || isApplyingRemoteState)) {
    hasQueuedCloudSave = true;
    return;
  }
  scheduleCloudSave();
}

function saveLocalState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Local save failed", error);
  }
}

function createSupabaseClient() {
  const config = window.ZACK_EAT_CONFIG || {};
  const url = String(config.supabaseUrl || "").trim();
  const anonKey = String(config.supabaseAnonKey || "").trim();

  if (!url || !anonKey || !window.supabase?.createClient) {
    return null;
  }

  return window.supabase.createClient(url, anonKey);
}

function setSyncStatus(text, status = "local") {
  if (!elements.syncStatus) return;
  elements.syncStatus.textContent = text;
  elements.syncStatus.dataset.status = status;
}

async function hydrateCloudState() {
  if (!cloudClient) {
    setSyncStatus("本地模式", "local");
    return;
  }

  setSyncStatus("连接云端", "pending");

  try {
    const row = await fetchCloudState();
    if (row?.data) {
      applyRemoteState(row);
      setSyncStatus("云端已同步", "synced");
    } else {
      cloudReady = true;
      hasQueuedCloudSave = false;
      await pushCloudState();
      setSyncStatus("云端已初始化", "synced");
    }

    cloudReady = true;
    if (hasQueuedCloudSave) {
      hasQueuedCloudSave = false;
      scheduleCloudSave();
    }
    startCloudPolling();
  } catch (error) {
    console.warn("Cloud sync init failed", error);
    cloudReady = false;
    setSyncStatus("云端未连接", "error");
  }
}

async function fetchCloudState() {
  const { data, error } = await cloudClient
    .from(CLOUD_TABLE_NAME)
    .select("data, updated_at")
    .eq("id", CLOUD_ROW_ID)
    .maybeSingle();

  if (error) throw error;
  return data;
}

function applyRemoteState(row) {
  if (!row?.data) return false;
  if (row.updated_at && row.updated_at === lastCloudUpdatedAt) return false;

  isApplyingRemoteState = true;
  try {
    state = normalizeState(row.data);
    lastCloudUpdatedAt = row.updated_at || "";
    saveLocalState();
    route();
  } finally {
    isApplyingRemoteState = false;
  }

  return true;
}

function scheduleCloudSave() {
  if (!cloudClient || !cloudReady || isApplyingRemoteState) return;
  hasQueuedCloudSave = false;
  window.clearTimeout(cloudSaveTimer);
  setSyncStatus("正在同步", "pending");
  cloudSaveTimer = window.setTimeout(async () => {
    cloudSaveTimer = null;
    try {
      await pushCloudState();
    } catch (error) {
      console.warn("Cloud save failed", error);
      setSyncStatus("同步失败", "error");
    }
  }, CLOUD_SAVE_DELAY_MS);
}

async function pushCloudState() {
  const { data, error } = await cloudClient
    .from(CLOUD_TABLE_NAME)
    .upsert(
      {
        id: CLOUD_ROW_ID,
        data: state,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    )
    .select("updated_at")
    .single();

  if (error) throw error;
  lastCloudUpdatedAt = data?.updated_at || "";
  setSyncStatus("云端已同步", "synced");
  return data;
}

function startCloudPolling() {
  window.clearInterval(cloudPollTimer);
  cloudPollTimer = window.setInterval(refreshCloudState, CLOUD_POLL_INTERVAL_MS);
}

async function refreshCloudState() {
  if (!cloudClient || !cloudReady || cloudSaveTimer) return;

  try {
    const row = await fetchCloudState();
    if (applyRemoteState(row)) {
      setSyncStatus("云端已同步", "synced");
    }
  } catch (error) {
    console.warn("Cloud refresh failed", error);
    setSyncStatus("同步延迟", "error");
  }
}

function createId(prefix) {
  const browserCrypto = globalThis.crypto;
  if (browserCrypto && typeof browserCrypto.randomUUID === "function") {
    return `${prefix}-${browserCrypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeRoomCode(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "")
    .slice(0, 32);
}

function normalizeFoodId(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\u4e00-\u9fa5-]/g, "")
    .slice(0, 48);
}

function splitTags(value) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }
  return String(value ?? "")
    .split(/[,，、;；\n]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeFoods(value) {
  const source = Array.isArray(value) ? value : cloneDefaultFoods();
  const usedIds = new Set();

  return source
    .map((food) => {
      const name = String(food.name || "").trim();
      if (!name) return null;
      const preferredId = normalizeFoodId(food.id || name);
      const id = getUniqueFoodId(preferredId || name, usedIds);
      usedIds.add(id);
      return {
        id,
        name,
        tags: splitTags(food.tags),
      };
    })
    .filter(Boolean);
}

function getUniqueFoodId(value, usedIds) {
  const base = normalizeFoodId(value) || createId("food");
  let id = base;
  let counter = 2;
  while (usedIds.has(id)) {
    id = `${base}-${counter}`;
    counter += 1;
  }
  return id;
}

function getRoomFoods(room) {
  if (!Array.isArray(room.foods)) {
    room.foods = cloneDefaultFoods();
  }
  return room.foods;
}

function cleanOptionIds(value, foods = defaultFoodOptions) {
  const validIds = new Set(foods.map((food) => food.id));
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => validIds.has(id)))];
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });
}

function optionName(optionId, foods = defaultFoodOptions) {
  return foods.find((food) => food.id === optionId)?.name || optionId;
}

function getActiveRoom() {
  return ensureRoom(state.activeRoomId);
}

function getRoomById(roomId) {
  return state.rooms.find((room) => room.id === roomId);
}

function ensureRoom(roomCode) {
  const id = normalizeRoomCode(roomCode);
  const fallbackId = id || defaultState.activeRoomId;
  let room = state.rooms.find((entry) => entry.id === fallbackId);
  if (!room) {
    room = {
      id: fallbackId,
      name: fallbackId,
      foods: cloneDefaultFoods(),
      members: [],
      currentPick: null,
      history: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    state.rooms.push(room);
  }
  state.activeRoomId = room.id;
  if (!state.activeAdminRoomId) {
    state.activeAdminRoomId = room.id;
  }
  return room;
}

function parseRoute() {
  const rawHash = window.location.hash.replace(/^#/, "");
  if (!rawHash || rawHash === "entry") {
    return { view: "entry" };
  }

  if (rawHash === "admin") {
    return { view: "admin" };
  }

  const params = new URLSearchParams(rawHash);
  if (params.has("result")) {
    return { view: "result", roomId: params.get("result") };
  }
  if (params.has("room")) {
    return { view: "room", roomId: params.get("room") };
  }

  return { view: "entry" };
}

function goToEntry() {
  window.location.hash = "entry";
}

function goToRoom(roomCode) {
  const room = ensureRoom(roomCode);
  saveState();
  window.location.hash = `room=${encodeURIComponent(room.id)}`;
}

function goToResult(roomCode) {
  const room = ensureRoom(roomCode);
  saveState();
  window.location.hash = `result=${encodeURIComponent(room.id)}`;
}

function route() {
  const currentRoute = parseRoute();

  if (currentRoute.view === "room" || currentRoute.view === "result") {
    ensureRoom(currentRoute.roomId);
    saveState();
  }

  if (currentRoute.view === "entry") {
    showView("entry");
    renderEntry();
  } else if (currentRoute.view === "room") {
    showView("room");
    renderRoomView(getActiveRoom());
  } else if (currentRoute.view === "result") {
    showView("result");
    renderResultView(getActiveRoom());
  } else if (currentRoute.view === "admin") {
    showView("admin");
    if (isAdminUnlocked()) {
      renderAdmin();
    } else {
      renderAdminLogin();
    }
  }

  renderShell();
}

function showView(viewName) {
  document.body.dataset.view = viewName;

  const viewMap = {
    entry: elements.entryView,
    room: elements.roomView,
    result: elements.resultView,
    admin: elements.adminView,
  };

  Object.entries(viewMap).forEach(([name, node]) => {
    node.classList.toggle("view--active", name === viewName);
  });

  elements.userEntryLink.classList.toggle(
    "is-hidden",
    viewName === "room" || viewName === "result",
  );
  elements.userEntryLink.classList.toggle("is-active", viewName !== "admin");
  elements.adminEntryLink.classList.toggle("is-active", viewName === "admin");
}

function getRoomDecision(room) {
  const members = room.members;
  const foods = getRoomFoods(room);
  const status = foods.map((food) => {
    const wantedBy = members
      .filter((member) => member.wants.includes(food.id))
      .map((member) => member.name);
    const blockedBy = members
      .filter((member) => member.avoids.includes(food.id))
      .map((member) => member.name);
    return {
      ...food,
      wantedBy,
      blockedBy,
      available: blockedBy.length === 0,
      wanted: wantedBy.length > 0,
      final: false,
    };
  });

  const available = members.length ? status.filter((food) => food.available) : [];
  const wantedAvailable = available.filter((food) => food.wanted);
  const baseFinalPool = wantedAvailable.length ? wantedAvailable : available;
  const useWantedWeight = baseFinalPool.some((food) => food.wantedBy.length > 0);
  const weightedFinalPool = baseFinalPool.map((food) => ({
    ...food,
    drawWeight: useWantedWeight ? food.wantedBy.length : 1,
  }));
  const totalWeight = weightedFinalPool.reduce((sum, food) => sum + food.drawWeight, 0);
  const finalPool = weightedFinalPool.map((food) => ({
    ...food,
    drawProbability: totalWeight ? food.drawWeight / totalWeight : 0,
  }));
  const probabilityById = new Map(
    finalPool.map((food) => [
      food.id,
      {
        drawWeight: food.drawWeight,
        drawProbability: totalWeight ? food.drawWeight / totalWeight : 0,
      },
    ]),
  );
  const finalIds = new Set(finalPool.map((food) => food.id));

  return {
    status: status.map((food) => {
      const probability = probabilityById.get(food.id);
      return {
        ...food,
        final: finalIds.has(food.id),
        drawWeight: probability?.drawWeight || 0,
        drawProbability: probability?.drawProbability || 0,
      };
    }),
    available,
    finalPool,
    blocked: status.filter((food) => !food.available),
    totalWeight,
  };
}

function renderShell() {
  const currentRoute = parseRoute();
  const room = state.rooms.length ? getActiveRoom() : null;
  const decision = room ? getRoomDecision(room) : { finalPool: [], blocked: [] };

  elements.roomCount.textContent = state.rooms.length;
  elements.memberCount.textContent = room?.members.length || 0;
  elements.finalCount.textContent = decision.finalPool.length;
  elements.blockedCount.textContent = decision.blocked.length;

  if (currentRoute.view === "admin") {
    renderHeaderState("后台", `${state.rooms.length} 个房间 · ${totalMemberCount()} 条成员提交`);
    elements.primaryActionButton.disabled = false;
    elements.primaryActionButton.querySelector("span:last-child").textContent = "返回用户入口";
    elements.copyRoomLinkButton.classList.add("is-hidden");
  } else if (currentRoute.view === "result") {
    const currentPick = room?.currentPick;
    renderHeaderState(
      currentPick ? currentPick.name : "结果池",
      `${room?.id || "无房间"} · ${decision.finalPool.length} 个结果 · 按想吃次数加权`,
    );
    elements.primaryActionButton.disabled = decision.finalPool.length === 0;
    elements.primaryActionButton.querySelector("span:last-child").textContent = "从结果池定一个";
    elements.copyRoomLinkButton.classList.remove("is-hidden");
    elements.copyRoomLinkButton.disabled = false;
  } else if (currentRoute.view === "room") {
    renderHeaderState(`房间 ${room?.id || ""}`, `${room?.members.length || 0} 人已提交`);
    elements.primaryActionButton.disabled = false;
    elements.primaryActionButton.querySelector("span:last-child").textContent = "查看结果池";
    elements.copyRoomLinkButton.classList.add("is-hidden");
  } else {
    renderHeaderState("用户入口", "输入房间号开始");
    elements.primaryActionButton.disabled = false;
    elements.primaryActionButton.querySelector("span:last-child").textContent = "进入当前房间";
    elements.copyRoomLinkButton.classList.add("is-hidden");
  }
}

function renderHeaderState(name, meta) {
  elements.resultName.textContent = name;
  elements.resultMeta.textContent = meta;
}

function totalMemberCount() {
  return state.rooms.reduce((sum, room) => sum + room.members.length, 0);
}

function isAdminUnlocked() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === "true";
}

function renderAdminLogin() {
  elements.adminLoginPanel.classList.remove("is-hidden");
  elements.adminContent.classList.add("is-hidden");
  elements.adminPasswordInput.value = "";
  elements.adminPasswordMessage.textContent = "";
  elements.adminPasswordInput.focus();
}

function renderEntry() {
  elements.roomCodeInput.value = "";
  if (!state.rooms.length) {
    elements.quickRoomList.innerHTML = `<div class="empty-state">还没有房间，输入房间号即可创建。</div>`;
    return;
  }

  elements.quickRoomList.innerHTML = state.rooms
    .map((room) => {
      const decision = getRoomDecision(room);
      return `
        <button class="quick-room" type="button" data-room-id="${room.id}">
          <strong>${escapeHtml(room.id)}</strong>
          <span>${room.members.length} 人 · ${getRoomFoods(room).length} 菜系 · ${decision.finalPool.length} 个结果</span>
        </button>
      `;
    })
    .join("");
}

function renderChoiceOptions() {
  const foods = getRoomFoods(getActiveRoom());
  if (!foods.length) {
    elements.wantOptions.innerHTML = `<div class="empty-state">本房间还没有菜系。</div>`;
    elements.avoidOptions.innerHTML = `<div class="empty-state">本房间还没有菜系。</div>`;
    return;
  }

  elements.wantOptions.innerHTML = foods
    .map((food) => renderChoiceOption(food, "wants"))
    .join("");
  elements.avoidOptions.innerHTML = foods
    .map((food) => renderChoiceOption(food, "avoids"))
    .join("");
}

function renderChoiceOption(food, groupName) {
  return `
    <label class="choice-option">
      <input type="checkbox" name="${groupName}" value="${food.id}" />
      <span>${escapeHtml(food.name)}</span>
    </label>
  `;
}

function renderRoomView(room) {
  elements.roomTitle.textContent = `房间 ${room.id}`;
  elements.backToEntryFromRoom.href = "#entry";
  renderChoiceOptions();
  renderRoomFoods(room);
  renderMemberSelect(room);
  renderMembers(room);
  clearPreferenceInputs();
}

function renderMemberSelect(room) {
  elements.memberSelect.innerHTML = [
    `<option value="${NEW_MEMBER_VALUE}">新成员</option>`,
    ...room.members.map(
      (member) => `<option value="${member.id}">${escapeHtml(member.name)}</option>`,
    ),
  ].join("");
  elements.memberSelect.value = NEW_MEMBER_VALUE;
  updateMemberFieldVisibility();
}

function renderRoomFoods(room) {
  const foods = getRoomFoods(room);
  if (!foods.length) {
    elements.roomFoodList.innerHTML = `<div class="empty-state">本房间还没有菜系。</div>`;
    return;
  }

  elements.roomFoodList.innerHTML = foods
    .map((food) => {
      const wantedCount = room.members.filter((member) => member.wants.includes(food.id)).length;
      const avoidedCount = room.members.filter((member) => member.avoids.includes(food.id)).length;
      return `
        <article class="item-card food-pool-card" data-food-id="${food.id}">
          <div class="item-card__top">
            <div>
              <h3>${escapeHtml(food.name)}</h3>
              <p>${escapeHtml(food.tags.join("、") || "无标签")}</p>
            </div>
            <button class="remove-button" type="button" data-action="remove-room-food" title="删除菜系">×</button>
          </div>
          <div class="tag-row">
            <span class="tag tag--green">想吃 ${wantedCount}</span>
            <span class="tag tag--blocked">不想吃 ${avoidedCount}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function updateMemberFieldVisibility() {
  const isNew = elements.memberSelect.value === NEW_MEMBER_VALUE;
  elements.newMemberField.classList.toggle("is-hidden", !isNew);
  if (!isNew) {
    const room = getActiveRoom();
    const member = room.members.find((entry) => entry.id === elements.memberSelect.value);
    if (member) {
      elements.memberNameInput.value = member.name;
      setSelectedOptionIds("wants", member.wants);
      setSelectedOptionIds("avoids", member.avoids);
    }
  } else {
    elements.memberNameInput.value = "";
    setSelectedOptionIds("wants", []);
    setSelectedOptionIds("avoids", []);
  }
  renderPreferenceSummary();
}

function clearPreferenceInputs() {
  elements.preferenceForm.reset();
  elements.memberSelect.value = NEW_MEMBER_VALUE;
  elements.wantMenu.open = false;
  elements.avoidMenu.open = false;
  elements.formMessage.textContent = "";
  updateMemberFieldVisibility();
}

function renderMembers(room) {
  if (!room.members.length) {
    elements.memberList.innerHTML = `<div class="empty-state">这个房间还没有人提交。</div>`;
    return;
  }

  elements.memberList.innerHTML = room.members
    .map(
      (member) => `
        <article class="item-card" data-id="${member.id}">
          <div class="item-card__top">
            <div>
              <h3>${escapeHtml(member.name)}</h3>
              <p>想吃 ${member.wants.length} 项 · 不想吃 ${member.avoids.length} 项</p>
            </div>
            <button class="remove-button" type="button" data-action="remove-member" title="删除提交">×</button>
          </div>
          <div class="preference-groups">
            <div>
              <span class="mini-label">想吃</span>
              <div class="tag-row">${renderTags(member.wants, "tag--green")}</div>
            </div>
            <div>
              <span class="mini-label">不想吃</span>
              <div class="tag-row">${renderTags(member.avoids, "tag--blocked")}</div>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderTags(optionIds, className = "") {
  const foods = getRoomFoods(getActiveRoom());
  if (!optionIds.length) return `<span class="tag tag--muted">无</span>`;
  return optionIds
    .map((id) => `<span class="tag ${className}">${escapeHtml(optionName(id, foods))}</span>`)
    .join("");
}

function getSelectedOptionIds(groupName) {
  return [...document.querySelectorAll(`input[name="${groupName}"]:checked`)].map(
    (input) => input.value,
  );
}

function setSelectedOptionIds(groupName, selectedIds) {
  const selected = new Set(selectedIds);
  document.querySelectorAll(`input[name="${groupName}"]`).forEach((input) => {
    input.checked = selected.has(input.value);
  });
}

function renderPreferenceSummary() {
  const wants = getSelectedOptionIds("wants");
  const avoids = getSelectedOptionIds("avoids");
  elements.wantSummary.textContent = wants.length ? `${wants.length} 项` : "未选择";
  elements.avoidSummary.textContent = avoids.length ? `${avoids.length} 项` : "未选择";
}

function renderResultView(room) {
  const decision = getRoomDecision(room);
  elements.resultRoomTitle.textContent = `房间 ${room.id} 的结果池`;
  elements.editMyChoiceLink.href = `#room=${encodeURIComponent(room.id)}`;
  elements.drawButton.disabled = decision.finalPool.length === 0;
  renderVoteCharts(room);
  renderFoods(decision);
  renderHistory(room);
}

function getVoteCounts(room, field) {
  const counts = new Map();
  const foods = getRoomFoods(room);
  room.members.forEach((member) => {
    member[field].forEach((optionId) => {
      counts.set(optionId, (counts.get(optionId) || 0) + 1);
    });
  });

  return foods
    .map((food) => ({
      id: food.id,
      name: food.name,
      count: counts.get(food.id) || 0,
    }))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, "zh-CN"));
}

function renderVoteCharts(room) {
  const wantVotes = getVoteCounts(room, "wants");
  const avoidVotes = getVoteCounts(room, "avoids");
  const wantTotal = sumVotes(wantVotes);
  const avoidTotal = sumVotes(avoidVotes);

  elements.wantChartTotal.textContent = `${wantTotal} 票`;
  elements.avoidChartTotal.textContent = `${avoidTotal} 票`;
  elements.wantChart.innerHTML = renderPieChart(wantVotes, "还没有人选择想吃。");
  elements.avoidChart.innerHTML = renderPieChart(avoidVotes, "还没有人选择不想吃。");
}

function sumVotes(items) {
  return items.reduce((sum, item) => sum + item.count, 0);
}

function renderPieChart(items, emptyText) {
  const total = sumVotes(items);
  if (!total) {
    return `<div class="empty-state chart-empty">${emptyText}</div>`;
  }

  let startDegree = 0;
  const segments = items.map((item, index) => {
    const endDegree = startDegree + (item.count / total) * 360;
    const color = chartColors[index % chartColors.length];
    const segment = `${color} ${startDegree.toFixed(2)}deg ${endDegree.toFixed(2)}deg`;
    startDegree = endDegree;
    return segment;
  });

  return `
    <div class="chart-body">
      <div class="pie-chart" style="background: conic-gradient(${segments.join(", ")});" aria-hidden="true"></div>
      <div class="chart-legend">
        ${items
          .map((item, index) => {
            const color = chartColors[index % chartColors.length];
            return `
              <div class="legend-row">
                <span class="legend-dot" style="background: ${color};"></span>
                <strong>${escapeHtml(item.name)}</strong>
                <span>${item.count} 票 · ${formatPercent(item.count / total)}</span>
              </div>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderFoods(decision) {
  const filter = elements.statusFilter.value;
  const filtered = decision.status.filter((food) => {
    if (filter === "final") return food.final;
    if (filter === "available") return food.available;
    if (filter === "blocked") return !food.available;
    return true;
  });

  if (!filtered.length) {
    elements.foodList.innerHTML = `<div class="empty-state">当前筛选下没有结果。</div>`;
    return;
  }

  elements.foodList.innerHTML = filtered
    .map((food) => {
      const stateTag = food.final
        ? `<span class="tag tag--green">结果池</span>`
        : food.available
          ? `<span class="tag tag--amber">未排除</span>`
          : `<span class="tag tag--blocked">已排除</span>`;
      const wantedTags = food.wantedBy
        .map((name) => `<span class="tag tag--green">${escapeHtml(name)} 想吃</span>`)
        .join("");
      const blockedTags = food.blockedBy
        .map((name) => `<span class="tag tag--blocked">${escapeHtml(name)} 不想吃</span>`)
        .join("");
      const drawTags = food.final
        ? `
          <span class="tag tag--blue">概率 ${formatPercent(food.drawProbability)}</span>
          <span class="tag tag--amber">权重 ${food.drawWeight}</span>
        `
        : "";

      return `
        <article class="item-card food-card ${food.final ? "is-final" : ""} ${food.available ? "" : "is-blocked"}">
          <div class="item-card__top">
            <div>
              <h3>${escapeHtml(food.name)}</h3>
              <p>${escapeHtml(food.tags.join("、"))}</p>
            </div>
          </div>
          <div class="tag-row">
            ${stateTag}
            ${drawTags}
            ${wantedTags}
            ${blockedTags}
          </div>
        </article>
      `;
    })
    .join("");
}

function formatPercent(value) {
  if (!Number.isFinite(value) || value <= 0) return "0%";
  const percentage = value * 100;
  if (percentage >= 10) return `${Math.round(percentage)}%`;
  return `${percentage.toFixed(1)}%`;
}

function renderHistory(room) {
  if (!room.history.length) {
    elements.historyList.innerHTML = `<li>暂无记录</li>`;
    return;
  }

  const formatter = new Intl.DateTimeFormat("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  elements.historyList.innerHTML = room.history
    .map((item) => {
      const time = item.pickedAt ? formatter.format(new Date(item.pickedAt)) : "";
      const probability = item.drawProbability ? ` · 概率 ${formatPercent(item.drawProbability)}` : "";
      return `<li><strong>${escapeHtml(item.name)}</strong> <span>${time} · ${item.memberCount} 人 · ${item.finalCount} 个结果${probability}</span></li>`;
    })
    .join("");
}

function renderAdmin() {
  elements.adminLoginPanel.classList.add("is-hidden");
  elements.adminContent.classList.remove("is-hidden");

  const activeRoom =
    getRoomById(state.activeAdminRoomId) || getRoomById(state.activeRoomId) || state.rooms[0];
  if (!activeRoom) {
    elements.adminRoomList.innerHTML = `<div class="empty-state">暂无房间。</div>`;
    elements.adminDetailTitle.textContent = "暂无房间";
    elements.adminDetail.innerHTML = `<div class="empty-state">从用户入口输入房间号即可创建新房间。</div>`;
    saveState();
    return;
  }

  state.activeAdminRoomId = activeRoom.id;

  elements.adminRoomList.innerHTML = state.rooms
    .map((room) => {
      const decision = getRoomDecision(room);
      return `
        <button class="admin-room-card ${room.id === activeRoom.id ? "is-active" : ""}" type="button" data-room-id="${room.id}">
          <strong>${escapeHtml(room.id)}</strong>
          <span>${room.members.length} 人 · ${getRoomFoods(room).length} 菜系 · ${decision.finalPool.length} 结果</span>
        </button>
      `;
    })
    .join("");

  renderAdminDetail(activeRoom);
  saveState();
}

function renderAdminDetail(room) {
  const decision = getRoomDecision(room);
  elements.adminDetailTitle.textContent = `房间 ${room.id}`;

  elements.adminDetail.innerHTML = `
    <div class="admin-actions">
      <button class="button button--danger" type="button" data-action="delete-admin-room">
        <span aria-hidden="true">×</span>
        <span>删除房间</span>
      </button>
      <span class="admin-message" data-role="admin-edit-message"></span>
    </div>

    <div class="admin-stats">
      <div><strong>${room.members.length}</strong><span>成员提交</span></div>
      <div><strong>${decision.finalPool.length}</strong><span>结果池</span></div>
      <div><strong>${decision.blocked.length}</strong><span>已排除</span></div>
    </div>

    <div class="admin-section">
      <h3>成员数据</h3>
      ${renderMemberTable(room)}
    </div>

    <div class="admin-section">
      <h3>菜品池</h3>
      ${renderRoomFoodTable(room)}
    </div>

    <div class="admin-section">
      <h3>结果数据</h3>
      ${renderFoodTable(decision.status)}
    </div>

    <div class="admin-section">
      <div class="section-head">
        <h3>编辑完整数据</h3>
        <button class="button button--secondary" type="button" data-action="save-admin-room-json">
          <span aria-hidden="true">✓</span>
          <span>保存 JSON</span>
        </button>
      </div>
      <textarea class="json-editor" data-role="admin-room-json" spellcheck="false">${escapeHtml(JSON.stringify(room, null, 2))}</textarea>
    </div>
  `;
}

function renderMemberTable(room) {
  const foods = getRoomFoods(room);
  const members = room.members;
  if (!members.length) return `<div class="empty-state">暂无成员提交。</div>`;

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>名字</th>
            <th>想吃</th>
            <th>不想吃</th>
          </tr>
        </thead>
        <tbody>
          ${members
            .map(
              (member) => `
                <tr>
                  <td>${escapeHtml(member.name)}</td>
                  <td>${escapeHtml(member.wants.map((id) => optionName(id, foods)).join("、") || "无")}</td>
                  <td>${escapeHtml(member.avoids.map((id) => optionName(id, foods)).join("、") || "无")}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderRoomFoodTable(room) {
  const foods = getRoomFoods(room);
  if (!foods.length) return `<div class="empty-state">暂无菜系。</div>`;

  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>菜系</th>
            <th>标签</th>
          </tr>
        </thead>
        <tbody>
          ${foods
            .map(
              (food) => `
                <tr>
                  <td>${escapeHtml(food.name)}</td>
                  <td>${escapeHtml(food.tags.join("、") || "无")}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderFoodTable(status) {
  return `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>选项</th>
            <th>状态</th>
            <th>权重/概率</th>
            <th>想吃的人</th>
            <th>排除的人</th>
          </tr>
        </thead>
        <tbody>
          ${status
            .map(
              (food) => `
                <tr>
                  <td>${escapeHtml(food.name)}</td>
                  <td>${food.final ? "结果池" : food.available ? "未排除" : "已排除"}</td>
                  <td>${food.final ? `${food.drawWeight} / ${formatPercent(food.drawProbability)}` : "0 / 0%"}</td>
                  <td>${escapeHtml(food.wantedBy.join("、") || "无")}</td>
                  <td>${escapeHtml(food.blockedBy.join("、") || "无")}</td>
                </tr>
              `,
            )
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function submitRoomCode(event) {
  event.preventDefault();
  const roomCode = normalizeRoomCode(elements.roomCodeInput.value);
  if (!roomCode) return;
  goToRoom(roomCode);
}

function addRoomFood(event) {
  event.preventDefault();
  const room = getActiveRoom();
  const foods = getRoomFoods(room);
  const name = elements.foodNameInput.value.trim();
  const tags = splitTags(elements.foodTagsInput.value);
  if (!name) return;

  const isDuplicate = foods.some((food) => food.name.trim().toLowerCase() === name.toLowerCase());
  if (isDuplicate) {
    elements.foodNameInput.focus();
    flashButton(elements.foodPoolForm.querySelector('button[type="submit"]'), "已存在");
    return;
  }

  const wants = getSelectedOptionIds("wants");
  const avoids = getSelectedOptionIds("avoids");
  const usedIds = new Set(foods.map((food) => food.id));
  foods.push({
    id: getUniqueFoodId(name, usedIds),
    name,
    tags,
  });
  room.currentPick = null;
  room.updatedAt = new Date().toISOString();
  elements.foodPoolForm.reset();
  saveState();
  renderChoiceOptions();
  setSelectedOptionIds("wants", wants);
  setSelectedOptionIds("avoids", avoids);
  renderPreferenceSummary();
  renderRoomFoods(room);
  renderShell();
}

function removeRoomFood(foodId) {
  const room = getActiveRoom();
  const foods = getRoomFoods(room);
  room.foods = foods.filter((food) => food.id !== foodId);
  room.members.forEach((member) => {
    member.wants = member.wants.filter((id) => id !== foodId);
    member.avoids = member.avoids.filter((id) => id !== foodId);
  });
  if (room.currentPick?.id === foodId) {
    room.currentPick = null;
  }
  room.updatedAt = new Date().toISOString();
  saveState();
  renderRoomView(room);
  renderShell();
}

function submitPreferences(event) {
  event.preventDefault();
  const room = getActiveRoom();
  const selectedMemberId = elements.memberSelect.value;
  const avoids = getSelectedOptionIds("avoids");
  const avoidSet = new Set(avoids);
  const wants = getSelectedOptionIds("wants").filter((id) => !avoidSet.has(id));

  let member;
  if (selectedMemberId === NEW_MEMBER_VALUE) {
    const name = elements.memberNameInput.value.trim();
    if (!name) {
      elements.formMessage.textContent = "请填写新成员名字。";
      elements.memberNameInput.focus();
      return;
    }
    const normalizedName = name.toLowerCase();
    member = room.members.find((entry) => entry.name.trim().toLowerCase() === normalizedName);
    if (!member) {
      member = { id: createId("m"), name, wants: [], avoids: [] };
      room.members.push(member);
    }
    member.name = name;
  } else {
    member = room.members.find((entry) => entry.id === selectedMemberId);
  }

  if (!member) return;

  member.wants = wants;
  member.avoids = avoids;
  room.currentPick = null;
  room.updatedAt = new Date().toISOString();
  saveState();
  goToResult(room.id);
}

function randomIndex(length) {
  if (length <= 1) return 0;
  const browserCrypto = globalThis.crypto;
  if (browserCrypto && typeof browserCrypto.getRandomValues === "function") {
    const array = new Uint32Array(1);
    browserCrypto.getRandomValues(array);
    return array[0] % length;
  }
  return Math.floor(Math.random() * length);
}

function randomFraction() {
  const browserCrypto = globalThis.crypto;
  if (browserCrypto && typeof browserCrypto.getRandomValues === "function") {
    const array = new Uint32Array(1);
    browserCrypto.getRandomValues(array);
    return array[0] / 4294967296;
  }
  return Math.random();
}

function weightedPick(pool) {
  const totalWeight = pool.reduce((sum, food) => sum + Math.max(food.drawWeight || 0, 0), 0);
  if (!totalWeight) return pool[randomIndex(pool.length)];

  let ticket = randomFraction() * totalWeight;
  for (const food of pool) {
    ticket -= food.drawWeight;
    if (ticket < 0) return food;
  }

  return pool[pool.length - 1];
}

function drawFood() {
  const room = getActiveRoom();
  const decision = getRoomDecision(room);

  if (!decision.finalPool.length) {
    room.currentPick = null;
    renderHeaderState("没有共同结果", "需要至少一位成员提交，且不能全部被排除。");
    elements.drawButton.classList.add("shake");
    window.setTimeout(() => elements.drawButton.classList.remove("shake"), 450);
    saveState();
    return;
  }

  const picked = weightedPick(decision.finalPool);
  room.currentPick = {
    id: picked.id,
    name: picked.name,
    drawWeight: picked.drawWeight,
    drawProbability: picked.drawProbability,
    pickedAt: new Date().toISOString(),
  };
  room.history = [
    {
      ...room.currentPick,
      memberCount: room.members.length,
      finalCount: decision.finalPool.length,
    },
    ...room.history,
  ].slice(0, 8);
  room.updatedAt = new Date().toISOString();

  saveState();
  renderResultView(room);
  renderShell();
  elements.resultName.classList.remove("shake");
  requestAnimationFrame(() => elements.resultName.classList.add("shake"));
}

async function copyRoomLink() {
  const currentRoute = parseRoute();
  if (currentRoute.view === "entry" || currentRoute.view === "admin") return;

  const room = getActiveRoom();
  const link = `${window.location.href.split("#")[0]}#room=${encodeURIComponent(room.id)}`;
  let copied = false;

  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(link);
      copied = true;
    }
  } catch {
    copied = false;
  }

  if (!copied) {
    copied = copyTextFallback(link);
  }

  flashButton(elements.copyRoomLinkButton, copied ? "已复制" : "复制失败");
}

function copyTextFallback(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

function flashButton(button, text) {
  const label = button.querySelector("span:last-child") || button;
  const original = label.textContent;
  label.textContent = text;
  window.setTimeout(() => {
    label.textContent = original;
  }, 1400);
}

function exportAllData() {
  const data = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      rooms: state.rooms,
      defaultFoodOptions,
    },
    null,
    2,
  );
  const copied = copyTextFallback(data);
  flashButton(elements.exportDataButton, copied ? "已复制 JSON" : "复制失败");
}

function submitAdminPassword(event) {
  event.preventDefault();
  if (elements.adminPasswordInput.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "true");
    renderAdmin();
    renderShell();
    return;
  }

  elements.adminPasswordMessage.textContent = "密码不正确。";
  elements.adminPasswordInput.select();
}

function logoutAdmin() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  renderAdminLogin();
  renderShell();
}

function setAdminMessage(text, type = "info") {
  const message = elements.adminDetail.querySelector('[data-role="admin-edit-message"]');
  if (!message) return;
  message.textContent = text;
  message.dataset.type = type;
}

function deleteAdminRoom() {
  const roomId = state.activeAdminRoomId;
  const room = getRoomById(roomId);
  if (!room) return;
  if (!window.confirm(`确认删除房间 ${room.id}？这个操作会删除该房间的成员、菜品池和历史记录。`)) {
    return;
  }

  state.rooms = state.rooms.filter((entry) => entry.id !== roomId);
  state.activeAdminRoomId = state.rooms[0]?.id || "";
  if (state.activeRoomId === roomId) {
    state.activeRoomId = state.rooms[0]?.id || "";
  }

  saveState();
  renderAdmin();
  renderShell();
}

function saveAdminRoomJson() {
  const editor = elements.adminDetail.querySelector('[data-role="admin-room-json"]');
  if (!editor) return;

  let parsed;
  try {
    parsed = JSON.parse(editor.value);
  } catch (error) {
    setAdminMessage(`JSON 格式错误：${error.message}`, "error");
    return;
  }

  const oldRoomId = state.activeAdminRoomId;
  const normalizedRoom = normalizeRoomObject(parsed, oldRoomId);
  if (!normalizedRoom) {
    setAdminMessage("房间数据需要包含有效的 id 或 name。", "error");
    return;
  }

  const duplicate = state.rooms.find(
    (room) => room.id === normalizedRoom.id && room.id !== oldRoomId,
  );
  if (duplicate) {
    setAdminMessage(`房间号 ${normalizedRoom.id} 已存在。`, "error");
    return;
  }

  const roomIndex = state.rooms.findIndex((room) => room.id === oldRoomId);
  if (roomIndex === -1) {
    setAdminMessage("当前房间不存在。", "error");
    return;
  }

  state.rooms[roomIndex] = normalizedRoom;
  state.activeAdminRoomId = normalizedRoom.id;
  if (state.activeRoomId === oldRoomId || !state.activeRoomId) {
    state.activeRoomId = normalizedRoom.id;
  }

  saveState();
  renderAdmin();
  renderShell();
  setAdminMessage("已保存。", "success");
}

elements.roomCodeForm.addEventListener("submit", submitRoomCode);
elements.quickRoomList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-room-id]");
  if (!button) return;
  goToRoom(button.dataset.roomId);
});

elements.memberSelect.addEventListener("change", updateMemberFieldVisibility);
elements.foodPoolForm.addEventListener("submit", addRoomFood);
elements.roomFoodList.addEventListener("click", (event) => {
  const removeButton = event.target.closest('[data-action="remove-room-food"]');
  if (!removeButton) return;
  const card = removeButton.closest(".item-card");
  removeRoomFood(card.dataset.foodId);
});
elements.preferenceForm.addEventListener("submit", submitPreferences);
elements.wantOptions.addEventListener("change", renderPreferenceSummary);
elements.avoidOptions.addEventListener("change", renderPreferenceSummary);

elements.memberList.addEventListener("click", (event) => {
  const removeButton = event.target.closest('[data-action="remove-member"]');
  if (!removeButton) return;
  const room = getActiveRoom();
  const id = removeButton.closest(".item-card").dataset.id;
  room.members = room.members.filter((member) => member.id !== id);
  room.currentPick = null;
  room.updatedAt = new Date().toISOString();
  saveState();
  renderRoomView(room);
  renderShell();
});

elements.statusFilter.addEventListener("change", () => renderResultView(getActiveRoom()));
elements.drawButton.addEventListener("click", drawFood);
elements.primaryActionButton.addEventListener("click", () => {
  const currentRoute = parseRoute();
  if (currentRoute.view === "admin") {
    goToEntry();
  } else if (currentRoute.view === "result") {
    drawFood();
  } else if (currentRoute.view === "room") {
    goToResult(getActiveRoom().id);
  } else {
    goToRoom(state.activeRoomId);
  }
});
elements.copyRoomLinkButton.addEventListener("click", copyRoomLink);
elements.copyRoomLinkInlineButton.addEventListener("click", copyRoomLink);

elements.clearHistoryButton.addEventListener("click", () => {
  const room = getActiveRoom();
  room.history = [];
  room.updatedAt = new Date().toISOString();
  saveState();
  renderResultView(room);
});

elements.adminRoomList.addEventListener("click", (event) => {
  const card = event.target.closest("[data-room-id]");
  if (!card) return;
  state.activeAdminRoomId = card.dataset.roomId;
  saveState();
  renderAdmin();
});

elements.adminDetail.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;

  if (actionButton.dataset.action === "delete-admin-room") {
    deleteAdminRoom();
  }

  if (actionButton.dataset.action === "save-admin-room-json") {
    saveAdminRoomJson();
  }
});

elements.adminPasswordForm.addEventListener("submit", submitAdminPassword);
elements.adminLogoutButton.addEventListener("click", logoutAdmin);
elements.exportDataButton.addEventListener("click", exportAllData);
window.addEventListener("hashchange", route);
