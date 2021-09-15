import { defineComponent, getCurrentInstance, inject, onMounted, onUnmounted, watch } from "vue";
import propTypes from "vue-types";
import { ATTR_MODAL_KEY } from "./DraggableModal";
import { InjectDraggableModalScope } from "./type";

export default defineComponent({
  name: "DraggableModalPanel",
  props: {
    label: propTypes.string.def("标签"),
    name: propTypes.string.isRequired,
    forceRender: propTypes.bool.def(false),
  },
  setup(props, { slots }) {
    const parent = inject<InjectDraggableModalScope>(ATTR_MODAL_KEY);
    const instance = getCurrentInstance();

    watch(
      () => [props.label, props.name],
      ([label, name]) => {
        if (instance) {
          parent?.updateItem(instance.uid, { label, name });
        }
      }
    );

    onMounted(() => {
      if (instance) {
        parent?.addItem({
          name: props.name,
          uid: instance.uid,
          label: props.label,
        });
      }
    });

    onUnmounted(() => {
      if (instance) {
        parent?.removeItem(instance?.uid);
      }
    });

    return () => {
      const isActive = parent?.activeIndex.value === props.name;
      if (props.forceRender) {
        const paneClass = ["draggable-modal__pane", { hidden: !isActive }];
        return <div class={paneClass}>{slots.default?.()}</div>;
      }
      return isActive && <div class="draggable-modal__pane">{slots.default?.()}</div>;
    };
  },
});
