<template>
  <div class="editor-fields">
    <div v-for="field in fields" :key="field.key" class="editor-field">
      <template v-if="field.type === 'list'">
        <h3>{{ field.label }}</h3>
        <details
          v-for="(entry, index) in getField(modelValue, field.key)"
          :key="index"
          class="editor-entry"
        >
          <summary>
            {{
              entry.question ||
              entry.name ||
              (entry.quote
                ? entry.quote.slice(0, 45) + "…"
                : `${field.label} ${Number(index) + 1}`)
            }}
          </summary>
          <AdminFields
            :model-value="entry"
            :fields="field.fields || []"
            :media="media"
            :pending="pending"
            @update:model-value="updateEntry(field.key, Number(index), $event)"
            @upload="emit('upload', $event)"
          />
          <button
            v-if="!field.fixed"
            type="button"
            class="editor-danger"
            @click="removeEntry(field.key, Number(index))"
          >
            Remove
            {{ field.label === "Questions" ? "question" : "testimonial" }}
          </button>
        </details>
        <button v-if="!field.fixed" type="button" @click="addEntry(field)">
          + Add {{ field.label === "Questions" ? "question" : "testimonial" }}
        </button>
      </template>
      <template v-else>
        <label :for="`${uid}-${field.key}`">{{ field.label }}</label>
        <AdminRichText
          v-if="field.type === 'rich'"
          :key="field.key"
          :model-value="getField(modelValue, field.key)"
          :label="field.label"
          @update:model-value="change(field.key, $event)"
        />
        <AdminImageField
          v-else-if="field.type === 'image'"
          :model-value="getField(modelValue, field.key)"
          :media="media"
          :pending="pending"
          @update:model-value="change(field.key, $event)"
          @upload="emit('upload', $event)"
        />
        <textarea
          v-else-if="field.type === 'textarea'"
          :id="`${uid}-${field.key}`"
          :value="getField(modelValue, field.key)"
          @input="
            change(field.key, ($event.target as HTMLTextAreaElement).value)
          "
          rows="4"
        />
        <input
          v-else
          :id="`${uid}-${field.key}`"
          :value="getField(modelValue, field.key)"
          type="text"
          @input="change(field.key, ($event.target as HTMLInputElement).value)"
          :placeholder="
            field.type === 'link' ? '/contact or https://…' : undefined
          "
        />
      </template>
    </div>
  </div>
</template>
<script setup lang="ts">
import { getField, setField } from "~/utils/page-content";
import type { EditorField } from "~/utils/page-schema";
import type { PendingImage } from "~/utils/editor-repository";
const props = defineProps<{
    modelValue: any;
    fields: EditorField[];
    media: string[];
    pending: PendingImage[];
  }>(),
  emit = defineEmits<{
    "update:modelValue": [value: any];
    upload: [image: PendingImage];
  }>();
const uid = useId();
function change(key: string, value: any) {
  const data = JSON.parse(JSON.stringify(props.modelValue));
  setField(data, key, value);
  emit("update:modelValue", data);
}
function updateEntry(key: string, index: number, value: any) {
  const entries = [...getField(props.modelValue, key)];
  entries[index] = value;
  change(key, entries);
}
function removeEntry(key: string, index: number) {
  change(
    key,
    getField(props.modelValue, key).filter((_: any, i: number) => i !== index),
  );
}
function addEntry(field: EditorField) {
  change(field.key, [
    ...getField(props.modelValue, field.key),
    Object.fromEntries((field.fields || []).map((f) => [f.key, ""])),
  ]);
}
</script>
