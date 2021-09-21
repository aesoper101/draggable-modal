import {
  defineComponent,
  watch,
  Teleport,
  reactive,
  computed,
  onMounted,
  ref,
  provide,
  PropType,
  CSSProperties,
} from "vue";
import { Button } from "ant-design-vue";

import { CloseOutlined } from "@ant-design/icons-vue";
import { DraggableModalItem, InjectDraggableModalScope } from "./type";
import buttonTypes from "ant-design-vue/es/button/buttonTypes";
import { addUnit, block, useState } from "vue3-normal-library";
import propTypes from "vue-types";
import { findIndex, merge, remove } from "lodash-es";

import "./index.scss";
import "ant-design-vue/lib/button/style/index.css";

export const DraggableModalProps = {
  title: propTypes.string.def("标题"),
  subTitle: propTypes.string.def(""),
  visible: propTypes.bool.def(false),
  closeable: propTypes.bool.def(true),
  loading: propTypes.bool.def(false),
  mask: propTypes.bool.def(true),
  maskClosable: propTypes.bool.def(true),
  destroyOnClose: propTypes.bool.def(true),
  width: propTypes.number.def(950),
  height: propTypes.number.def(500),
  zIndex: propTypes.number.def(9999),
  activeKey: propTypes.string.def(""),
  okButtonProps: propTypes.shape(buttonTypes).loose,
  cancelButtonProps: propTypes.shape(buttonTypes).loose,
  bodyStyle: {
    type: Object as PropType<CSSProperties>,
    default: () => {
      return {};
    },
  },
  tabType: propTypes.oneOf(["left", "top"]).def("top"),
};

export const ATTR_MODAL_KEY = "My-ATTR_MODAL_KEY";

const b = block("draggable-modal", "");

export default defineComponent({
  name: "DraggableModal",
  components: { CloseOutlined },
  props: DraggableModalProps,
  emits: ["update:activeKey", "update:visible", "cancel", "ok", "close"],
  setup(props, { slots, emit }) {
    const [visible, setVisible] = useState(props.visible);

    // refs
    const containerEle = ref<HTMLElement | null>(null);
    const headerEle = ref<HTMLElement | null>(null);

    const items = ref<DraggableModalItem[]>([]);
    const [activeIndex, setActiveIndex] = useState(props.activeKey);

    const rect = reactive({
      left: 0,
      top: 100,
    });

    const changeActiveItem = (item: DraggableModalItem) => {
      setActiveIndex(item.name);
      emit("update:activeKey", item.name);
    };

    const addItem = (item: DraggableModalItem) => {
      if (!activeIndex.value) {
        changeActiveItem(item);
      }
      items.value.push(item);
    };

    const removeItem = (uid: number) => {
      remove(items.value, { uid: uid });
    };

    const updateItem = (uid: number, item: Omit<DraggableModalItem, "uid">) => {
      const index = findIndex(items.value, { uid });
      if (index > -1) {
        merge(items.value[index], item);
      }
    };

    provide<InjectDraggableModalScope>(ATTR_MODAL_KEY, {
      items,
      addItem,
      removeItem,
      activeIndex,
      updateItem,
    });

    watch(
      () => props.visible,
      (value) => {
        setVisible(value);
      }
    );

    watch(
      () => props.activeKey,
      (value) => {
        setActiveIndex(value);
      }
    );

    const updateVisible = () => {
      setVisible(false);
      emit("update:visible", false);
    };

    const onClose = () => {
      updateVisible();
      emit("close");
    };

    const onOK = () => {
      emit("ok");
    };

    const onCancel = () => {
      updateVisible();
      emit("cancel");
    };

    const onClickMask = () => {
      if (props.maskClosable) {
        onClose();
      }
    };

    const onMouseDown = (evt: MouseEvent) => {
      if (containerEle.value) {
        const offsetTop = containerEle.value?.offsetTop;
        const offsetLeft = containerEle.value?.offsetLeft;

        const clientX = evt.clientX;
        const clientY = evt.clientY;

        document.onmousemove = (e) => {
          e.preventDefault();

          const innerWidth = window.innerWidth;
          const innerHeight = window.innerHeight;

          const offsetWidth = containerEle.value?.offsetWidth ?? props.width;
          const offsetHeight = containerEle.value?.offsetHeight ?? props.height + 65 + 91;

          const right = innerWidth - offsetWidth;
          const bottom = innerHeight - offsetHeight;

          const clientXNow = e.clientX;
          const clientYNow = e.clientY;

          let top = clientYNow - clientY + offsetTop;
          let left = clientXNow - clientX + offsetLeft;

          if (top < 0) {
            top = 0;
          }

          if (left < 0) {
            left = 0;
          }

          if (left >= right) {
            left = right;
          }

          if (top >= bottom) {
            top = bottom;
          }

          rect.top = top;
          rect.left = left;
        };
      }
    };

    const onMouseUp = () => {
      document.onmousemove = null;
      document.onmouseup = null;
    };

    onMounted(() => {
      if (containerEle.value) {
        const offsetWidth = containerEle.value.offsetWidth || props.width;
        rect.left = (window.innerWidth - offsetWidth) / 2;
      }
    });

    const getStyle = computed(() => {
      return {
        width: addUnit(props.width),
        left: addUnit(rect.left),
        top: addUnit(rect.top),
        zIndex: props.zIndex,
      };
    });

    const getContentStyle = computed(() => {
      return {
        width: addUnit(props.width),
        height: addUnit(props.height),
      };
    });

    const renderTopBar = () => {
      return items.value.map((value) => {
        const itemClass = ["bar-item", { active: activeIndex.value === value.name }];
        return (
          <div class={itemClass} onClick={() => changeActiveItem(value)}>
            {value.label}
          </div>
        );
      });
    };

    const renderHeader = () => {
      return (
        <div ref={headerEle} class={b("header")} onMousedown={onMouseDown} onMouseup={onMouseUp}>
          {props.title && <div class="title">{props.title}</div>}
          {props.subTitle && <div class="sub-title">{props.subTitle}</div>}
          {props.tabType === "top" && items.value.length > 0 && (
            <div class="bar-nav">{renderTopBar()}</div>
          )}
          {props.closeable && (
            <div class="close-icon">
              <CloseOutlined
                style={{ fontSize: addUnit(20), color: "#7f7f7f" }}
                onClick={onClose}
              />
            </div>
          )}
        </div>
      );
    };

    const renderLeftBar = () => {
      const nodes = items.value.map((v) => {
        const itemClass = ["tab-item", { active: activeIndex.value === v.name }];
        return (
          <div class={itemClass} onClick={() => changeActiveItem(v)}>
            <div class="text">{v.label}</div>
          </div>
        );
      });

      return <div class="left-wrapper">{nodes}</div>;
    };

    const renderContent = () => {
      return (
        <div class={b("content")} style={getContentStyle.value}>
          {props.tabType === "left" && items.value.length > 0 && renderLeftBar()}
          <div class="right-wrapper" style={props.bodyStyle}>
            {slots.default?.()}
          </div>
        </div>
      );
    };

    const renderFooter = () => {
      const cancelBtnProps = {
        onClick: onCancel,
        ...(props.cancelButtonProps || { type: "primary", danger: true }),
      };
      const okBtnProps = {
        onClick: onOK,

        ...(props.okButtonProps || { type: "primary" }),
      };

      return (
        <div class={b("footer")}>
          <div class={b("footer-inner")}>
            <Button class="btn" {...okBtnProps}>
              确认
            </Button>
            <Button class="btn" {...cancelBtnProps}>
              取消
            </Button>
          </div>
        </div>
      );
    };

    const destroyContent = computed(() => {
      if (visible.value || !props.destroyOnClose) {
        return true;
      }

      return props.destroyOnClose && !visible.value;
    });

    return () => {
      return (
        <Teleport to={"body"}>
          {props.mask && <div class={b("bg")} v-show={visible.value} onClick={onClickMask} />}
          <div class={b()} style={getStyle.value} ref={containerEle} v-show={visible.value}>
            {destroyContent.value && renderHeader()}
            {destroyContent.value && renderContent()}
            {destroyContent.value && renderFooter()}
          </div>
        </Teleport>
      );
    };
  },
});
