<template>
  <div class="rich-editor">
    <div class="rich-toolbar" role="toolbar" aria-label="Text formatting">
      <button
        v-for="tool in tools"
        :key="tool.command"
        type="button"
        @mousedown.prevent
        @click="format(tool.command)"
        :aria-label="tool.label"
      >
        {{ tool.label }}
      </button>
      <button
        type="button"
        @mousedown.prevent
        @click="
          showLink = true;
          rememberSelection();
        "
      >
        Link
      </button>
      <button type="button" @mousedown.prevent @click="format('unlink')">
        Remove link
      </button>
    </div>
    <div v-if="showLink" class="editor-inline">
      <input
        v-model="link"
        type="text"
        aria-label="Link destination"
        placeholder="https://… or /contact"
      /><button type="button" @click="addLink">Add link</button
      ><button type="button" @click="showLink = false">Close</button>
    </div>
    <div
      ref="editor"
      class="rich-input"
      contenteditable="true"
      role="textbox"
      :aria-label="label"
      aria-multiline="true"
      @input="update"
      @paste="paste"
      @blur="update"
    />
  </div>
</template>
<script setup lang="ts">
import { safeHtml, safeLink } from "~/utils/page-content";
const props = defineProps<{ modelValue: string; label: string }>(),
  emit = defineEmits<{ "update:modelValue": [value: string] }>();
const editor = ref<HTMLElement>(),
  showLink = ref(false),
  link = ref("");
const tools = [
  { command: "bold", label: "Bold" },
  { command: "italic", label: "Italic" },
  { command: "underline", label: "Underline" },
  { command: "insertUnorderedList", label: "Bullets" },
];
let selection: Range | undefined;
function rememberSelection() {
  const s = window.getSelection();
  if (s?.rangeCount) selection = s.getRangeAt(0).cloneRange();
}
function update() {
  if (editor.value) emit("update:modelValue", safeHtml(editor.value.innerHTML));
}
function format(command: string) {
  editor.value?.focus();
  document.execCommand(command, false);
  update();
}
function addLink() {
  const url = safeLink(link.value);
  if (url === "#") return;
  editor.value?.focus();
  if (selection) {
    const s = window.getSelection();
    s?.removeAllRanges();
    s?.addRange(selection);
  }
  document.execCommand("createLink", false, url);
  showLink.value = false;
  link.value = "";
  update();
}
function paste(event: ClipboardEvent) {
  event.preventDefault();
  const text = event.clipboardData?.getData("text/plain") || "";
  document.execCommand("insertText", false, text);
  update();
}
onMounted(() => {
  if (editor.value) editor.value.innerHTML = safeHtml(props.modelValue);
});
watch(
  () => props.modelValue,
  (value: string) => {
    if (editor.value && document.activeElement !== editor.value)
      editor.value.innerHTML = safeHtml(value);
  },
);
</script>
