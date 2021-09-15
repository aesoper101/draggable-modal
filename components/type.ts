import { Ref, UnwrapRef } from "vue";

export interface DraggableModalItem {
  uid: number;
  label: string;
  name: string;
}

export interface InjectDraggableModalScope {
  items: Ref<UnwrapRef<DraggableModalItem[]>>;
  addItem: (item: DraggableModalItem) => void;
  updateItem: (uid: number, item: Omit<DraggableModalItem, "uid">) => void;
  removeItem: (uid: number) => void;
  activeIndex: Ref<string>;
}
