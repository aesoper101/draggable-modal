# Draggable Modal

## USING

```vue
<script setup lang="ts">
  // This starter template is using Vue 3 <script setup> SFCs
  // Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
  import { DraggableModal, DraggableModalPanel } from "draggable-modal";
  import "draggable-modal/style.css";
</script>

<template>
  <img alt="Vue logo" src="./assets/logo.png" />
  <DraggableModal :visible="true">
    <DraggableModalPanel name="1" label="Test">Test</DraggableModalPanel>
    <DraggableModalPanel name="2" label="Test1">
      <div style="height: 800px">Test1</div>
    </DraggableModalPanel>
  </DraggableModal>
</template>

<style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
  }
</style>
```
