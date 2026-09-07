<template>
  <div class="editor">
    <header class="editor-topbar">
      <a href="/admin/" class="editor-brand"><span>BT</span> Site editor</a>
      <nav v-if="data" aria-label="Editor tools">
        <button
          v-for="item in tabs"
          :key="item.id"
          type="button"
          :class="{ active: tab === item.id }"
          @click="changeTab(item.id)"
        >
          {{ item.label }}
        </button>
      </nav>
      <div class="editor-top-actions">
        <span v-if="demo" class="editor-badge">Local preview</span
        ><span v-else-if="config" class="editor-badge">{{
          config.branch === "master" ? "Live site" : "Preview site"
        }}</span
        ><a href="/" target="_blank" rel="noopener">View site ↗</a
        ><button v-if="token" type="button" @click="signOut">Sign out</button
        ><button
          v-if="data"
          type="button"
          class="editor-primary"
          :disabled="busy || (!dirty && !editing)"
          @click="publish"
        >
          {{ busy ? "Saving…" : "Save & publish" }}
        </button>
      </div>
    </header>
    <div
      v-if="message || error || dirty || editing"
      class="editor-status"
      :class="{ 'editor-status-error': error }"
      :role="error ? 'alert' : 'status'"
    >
      <span>{{ error || message || "You have unpublished changes." }}</span>
      <div v-if="error && data" class="editor-inline">
        <button type="button" @click="downloadChanges">Download changes</button
        ><button type="button" :disabled="busy" @click="reload">
          Reload latest
        </button>
      </div>
    </div>
    <div v-if="loading" class="editor-welcome">
      <h1>Opening your editor…</h1>
      <p>Loading the latest website content.</p>
    </div>
    <div v-else-if="!data" class="editor-welcome">
      <span class="editor-welcome-mark">BT</span>
      <p class="editor-eyebrow">BINGE THINKERS</p>
      <h1>A little planning.<br />A great night.</h1>
      <p>
        Manage your calendar, saved Locations, and website pages in one place.
      </p>
      <button
        type="button"
        class="editor-primary"
        :disabled="!config"
        @click="signIn"
      >
        Sign in with GitHub
      </button>
      <p class="editor-muted">
        Use the GitHub account you already use to edit the site.
      </p>
    </div>
    <template v-else>
      <fieldset class="editor-content" :disabled="busy">
        <AdminCalendar
          v-if="tab === 'calendar'"
          ref="calendarEditor"
          v-model="data.events.events"
          v-model:locations="data.locations.locations"
          :maps-key="config?.mapsKey"
          @publish="publish"
          @editing="editing = $event"
        />
        <AdminLocations
          v-else-if="tab === 'locations'"
          ref="locationEditor"
          v-model="data.locations.locations"
          :events="data.events.events"
          :maps-key="config?.mapsKey"
          @publish="publish"
          @editing="editing = $event"
        />
        <section v-else class="page-workspace">
          <div class="page-preview-column">
            <div class="page-toolbar">
              <div>
                <p class="editor-eyebrow">VISUAL PAGE EDITOR</p>
                <label for="page-choice" class="visually-hidden"
                  >Page to edit</label
                ><select
                  id="page-choice"
                  v-model="pageId"
                  @change="sectionId = pageSections[pageId][0].id"
                >
                  <option
                    v-for="page in pageChoices"
                    :key="page.id"
                    :value="page.id"
                  >
                    {{ page.label }}
                  </option>
                </select>
              </div>
              <div class="editor-inline">
                <button
                  type="button"
                  :class="{ active: !mobilePreview }"
                  @click="mobilePreview = false"
                >
                  Desktop</button
                ><button
                  type="button"
                  :class="{ active: mobilePreview }"
                  @click="mobilePreview = true"
                >
                  Phone</button
                ><button type="button" @click="sectionId = 'settings'">
                  Page settings
                </button>
              </div>
            </div>
            <p class="page-instructions">
              Click a section to edit it. Your page layout stays in place.
            </p>
            <div
              class="page-preview-frame"
              :class="{ 'page-preview-phone': mobilePreview }"
            >
              <iframe
                ref="preview"
                :src="`${pageChoices.find((p) => p.id === pageId)!.url}?editor-preview=1`"
                title="Interactive page preview"
                @load="sendPreview"
              />
            </div>
          </div>
          <aside class="editor-panel page-panel">
            <p class="editor-eyebrow">
              {{ sectionId === "settings" ? "PAGE SETTINGS" : "EDIT SECTION" }}
            </p>
            <label for="section-choice" class="visually-hidden"
              >Section to edit</label
            ><select id="section-choice" v-model="sectionId">
              <option
                v-for="section in [...pageSections[pageId], pageSettings]"
                :key="section.id"
                :value="section.id"
              >
                {{ section.label }}
              </option>
            </select>
            <p class="editor-muted">
              Changes appear in the preview. Save &amp; publish when you’re
              ready.
            </p>
            <AdminFields
              :key="`${pageId}-${sectionId}`"
              v-model="data.pages[pageId]"
              :fields="activeSection.fields"
              :media="snapshot?.media || []"
              :pending="allImages"
              @upload="images.push($event)"
            />
          </aside>
        </section>
      </fieldset>
    </template>
  </div>
</template>
<script setup lang="ts">
import initialEvents from "~/data/events.json";
import initialLocations from "~/data/locations.json";
import initialPages from "~/data/pages.json";
import {
  EditorRepository,
  RepositoryError,
  type EditorConfig,
  type EditorData,
  type Snapshot,
  type PendingImage,
} from "~/utils/editor-repository";
import {
  pageChoices,
  pageSections,
  pageSettings,
  type EditorField,
} from "~/utils/page-schema";
import { getField, safeHtml, safeLink, setField } from "~/utils/page-content";
import { validateRecord, type EventRecord } from "~/utils/schedule";
useSeoMeta({
  title: "Binge Thinkers — Site editor",
  robots: "noindex,nofollow",
});
const tabs = [
  { id: "calendar", label: "Calendar" },
  { id: "locations", label: "Locations" },
  { id: "pages", label: "Pages" },
];
const tab = ref("calendar"),
  token = ref(""),
  config = ref<EditorConfig>(),
  data = ref<EditorData>(),
  snapshot = ref<Snapshot>(),
  images = ref<PendingImage[]>([]),
  busy = ref(false),
  loading = ref(true),
  error = ref(""),
  message = ref(""),
  editing = ref(false),
  demo = ref(false);
const pageId = ref("home"),
  sectionId = ref("hero"),
  mobilePreview = ref(false),
  preview = ref<HTMLIFrameElement>(),
  calendarEditor = ref<any>(),
  locationEditor = ref<any>();
const publishedImages = ref<PendingImage[]>([]);
const allImages = computed(() => [...publishedImages.value, ...images.value]);
const activeSection = computed(() =>
  sectionId.value === "settings"
    ? pageSettings
    : pageSections[pageId.value].find((s) => s.id === sectionId.value) ||
      pageSections[pageId.value][0],
);
const dirty = computed(
  () =>
    !!data.value &&
    (images.value.length > 0 ||
      JSON.stringify(data.value) !== JSON.stringify(snapshot.value?.data)),
);
const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value));
let popup: Window | null = null,
  authTimer: ReturnType<typeof setInterval> | undefined,
  authStarted = false;
const repo = () => new EditorRepository(config.value!, token.value);
function captureError(e: unknown) {
  error.value =
    e instanceof Error
      ? e.message
      : "Something went wrong. Your edits are still here.";
  if (e instanceof RepositoryError && e.status === 401) {
    sessionStorage.removeItem("binge-editor-token");
    token.value = "";
  }
}
async function load() {
  loading.value = true;
  error.value = "";
  try {
    snapshot.value = await repo().load();
    data.value = clone(snapshot.value.data);
  } catch (e) {
    captureError(e);
  } finally {
    loading.value = false;
  }
}
onMounted(async () => {
  try {
    const res = await fetch("/admin/editor-config.json", { cache: "no-store" });
    if (!res.ok)
      throw new Error(
        "Editor configuration could not load. Please reload the page.",
      );
    config.value = await res.json();
    const configured = new URL(config.value!.oauthBase);
    if (
      location.hostname.endsWith(".pages.dev") &&
      configured.hostname.endsWith(".pages.dev") &&
      location.origin !== configured.origin
    ) {
      location.replace(`${configured.origin}/admin/`);
      return;
    }
    window.addEventListener("message", receive);
    window.addEventListener("beforeunload", beforeUnload);
    demo.value =
      !!import.meta.dev &&
      new URLSearchParams(location.search).get("demo") === "1";
    if (demo.value) {
      data.value = clone({
        events: initialEvents,
        locations: initialLocations,
        pages: initialPages,
      }) as EditorData;
      snapshot.value = {
        head: "local",
        tree: "local",
        data: clone(data.value),
        media: collectImages(initialPages),
      };
      message.value =
        "Local preview — changes can be explored here, but cannot be published.";
      loading.value = false;
      return;
    }
    token.value = sessionStorage.getItem("binge-editor-token") || "";
    if (token.value) await load();
    else loading.value = false;
  } catch (e) {
    captureError(e);
    loading.value = false;
  }
});
function collectImages(value: any): string[] {
  if (typeof value === "string")
    return /^\/.*\.(png|jpg|jpeg|webp|gif|avif)$/i.test(value) ? [value] : [];
  if (value && typeof value === "object")
    return [...new Set(Object.values(value).flatMap(collectImages))];
  return [];
}
function signIn() {
  if (!config.value) return;
  error.value = "";
  authStarted = true;
  localStorage.removeItem("decap-oauth-pending");
  popup = window.open(
    `${config.value.oauthBase}/api/auth`,
    "binge-editor-signin",
    "width=600,height=720",
  );
  if (!popup) {
    error.value = "Allow the sign-in popup, then try again.";
    authStarted = false;
    return;
  }
  clearInterval(authTimer);
  authTimer = setInterval(() => {
    const raw = localStorage.getItem("decap-oauth-pending");
    if (raw) {
      localStorage.removeItem("decap-oauth-pending");
      try {
        completeAuth(JSON.parse(raw));
      } catch {
        error.value = "Could not finish sign-in. Please try again.";
      }
    }
  }, 500);
}
async function completeAuth(payload: any) {
  if (!authStarted) return;
  authStarted = false;
  clearInterval(authTimer);
  if (
    payload.status !== "success" ||
    typeof payload.content?.token !== "string"
  ) {
    error.value = "Sign-in was not completed. Please try again.";
    return;
  }
  token.value = payload.content.token;
  sessionStorage.setItem("binge-editor-token", token.value);
  popup?.close();
  if (!data.value) await load();
  else
    message.value = "Signed in again. Your unpublished changes are still here.";
}
function receive(event: MessageEvent) {
  if (
    event.source === preview.value?.contentWindow &&
    event.origin === location.origin
  ) {
    if (event.data?.pageId !== pageId.value) return;
    if (event.data.type === "editor:ready") sendPreview();
    if (
      event.data.type === "editor:select" &&
      pageSections[pageId.value].some((s) => s.id === event.data.section)
    )
      sectionId.value = event.data.section;
    return;
  }
  if (
    !authStarted ||
    event.source !== popup ||
    event.origin !== new URL(config.value!.oauthBase).origin
  )
    return;
  if (event.data === "authorizing:github")
    popup?.postMessage("authorizing:github", event.origin);
  if (
    typeof event.data === "string" &&
    event.data.startsWith("authorization:github:")
  ) {
    const match = event.data.match(
      /^authorization:github:(success|error):([\s\S]*)$/,
    );
    if (match) {
      try {
        completeAuth({ status: match[1], content: JSON.parse(match[2]) });
      } catch {
        error.value = "Could not finish sign-in.";
      }
    }
  }
}
function beforeUnload(event: BeforeUnloadEvent) {
  if (dirty.value || editing.value) {
    event.preventDefault();
    event.returnValue = "";
  }
}
function changeTab(next: string) {
  if (editing.value && !confirm("Discard the unsaved changes in this panel?"))
    return;
  editing.value = false;
  tab.value = next;
}
function signOut() {
  if (
    (dirty.value || editing.value) &&
    !confirm("Discard unpublished changes and sign out?")
  )
    return;
  sessionStorage.removeItem("binge-editor-token");
  token.value = "";
  data.value = undefined;
  snapshot.value = undefined;
  for (const image of allImages.value) URL.revokeObjectURL(image.preview);
  images.value = [];
  publishedImages.value = [];
  editing.value = false;
  message.value = "";
}
async function reload() {
  if (
    !confirm(
      "Reloading replaces your unpublished edits with the latest saved content. Continue?",
    )
  )
    return;
  editing.value = false;
  for (const image of allImages.value) URL.revokeObjectURL(image.preview);
  images.value = [];
  publishedImages.value = [];
  await load();
}
function sendPreview() {
  if (!data.value || !preview.value?.contentWindow) return;
  let content = clone(data.value.pages[pageId.value]);
  const substitute = (value: any): any =>
    typeof value === "string"
      ? allImages.value.find((i: PendingImage) => i.path === `public${value}`)
          ?.preview || value
      : Array.isArray(value)
        ? value.map(substitute)
        : value && typeof value === "object"
          ? Object.fromEntries(
              Object.entries(value).map(([k, v]) => [k, substitute(v)]),
            )
          : value;
  content = substitute(content);
  preview.value.contentWindow.postMessage(
    { type: "editor:content", pageId: pageId.value, content },
    location.origin,
  );
  preview.value.contentWindow.postMessage(
    { type: "editor:highlight", section: sectionId.value },
    location.origin,
  );
}
watch(() => data.value?.pages, sendPreview, { deep: true });
watch(
  data,
  () => {
    if (dirty.value) message.value = "";
  },
  { deep: true },
);
watch(sectionId, sendPreview);
watch(images, sendPreview, { deep: true });
function validateFields(
  value: any,
  fields: EditorField[],
  prefix: string,
  errors: string[],
) {
  for (const field of fields) {
    const v = getField(value, field.key);
    if (field.type === "list") {
      if (!Array.isArray(v)) {
        errors.push(`${prefix}: ${field.label} is invalid.`);
        continue;
      }
      for (const [index, entry] of v.entries()) {
        validateFields(
          entry,
          field.fields || [],
          `${prefix}, ${field.label} ${index + 1}`,
          errors,
        );
        const required =
          field.key === "questions"
            ? ["question", "answer"]
            : field.key === "testimonials"
              ? ["quote", "name"]
              : [];
        if (
          required.some(
            (key) =>
              !safeHtml(entry[key])
                .replace(/<[^>]*>/g, "")
                .replace(/&nbsp;/g, " ")
                .trim(),
          )
        )
          errors.push(
            `${prefix}: complete ${field.label.toLowerCase()} ${index + 1}, or remove it.`,
          );
      }
    } else if (typeof v !== "string")
      errors.push(`${prefix}: ${field.label} must contain text.`);
    else if (field.type === "link" && v !== "#" && safeLink(v) === "#")
      errors.push(`${prefix}: choose a valid destination for ${field.label}.`);
    else if (field.type === "rich") setField(value, field.key, safeHtml(v));
  }
}
async function publish() {
  if (busy.value || !data.value) return;
  error.value = "";
  message.value = "";
  if (
    calendarEditor.value?.applyEditor() === false ||
    locationEditor.value?.applyEditor() === false
  )
    return;
  await nextTick();
  const issues = data.value.events.events.flatMap((r: EventRecord) =>
    validateRecord(r, data.value!.locations.locations),
  );
  for (const page of pageChoices)
    validateFields(
      data.value.pages[page.id],
      [
        ...pageSections[page.id].flatMap((s) => s.fields),
        ...pageSettings.fields,
      ],
      page.label,
      issues,
    );
  if (issues.length) {
    error.value = [...new Set(issues)].join(" ");
    return;
  }
  if (!dirty.value) {
    message.value = "No changes to publish.";
    return;
  }
  if (demo.value) {
    message.value =
      "Preview changes applied. This local preview cannot publish to the website.";
    return;
  }
  if (!token.value) {
    signIn();
    return;
  }
  busy.value = true;
  try {
    snapshot.value = await repo().publish(
      snapshot.value!,
      clone(data.value),
      images.value,
    );
    publishedImages.value.push(...images.value);
    images.value = [];
    message.value =
      "Saved. Your site is rebuilding; changes will appear when publishing finishes.";
    sendPreview();
  } catch (e) {
    captureError(e);
  } finally {
    busy.value = false;
  }
}
function downloadChanges() {
  if (!data.value) return;
  const url = URL.createObjectURL(
    new Blob(
      [
        JSON.stringify(
          {
            content: data.value,
            images: images.value.map(({ path, base64 }: PendingImage) => ({
              path,
              base64,
            })),
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    ),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = "binge-thinkers-unpublished-changes.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
onBeforeUnmount(() => {
  clearInterval(authTimer);
  window.removeEventListener("message", receive);
  window.removeEventListener("beforeunload", beforeUnload);
  for (const image of allImages.value) URL.revokeObjectURL(image.preview);
});
</script>
<style src="~/assets/css/editor.css"></style>
