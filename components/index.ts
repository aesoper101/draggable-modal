import { App, Plugin } from "vue";
import DraggableModal from "./DraggableModal";
import DraggableModalPanel from "./DraggableModalPanel";

const DraggableModalPlugin: Plugin = {
  install: (app: App) => {
    app.component(DraggableModal.name, DraggableModal);
    app.component(DraggableModalPanel.name, DraggableModalPanel);
  },
};

export { DraggableModal, DraggableModalPanel };

export default DraggableModalPlugin;
