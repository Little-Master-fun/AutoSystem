/// <reference types="vite/client" />
declare module 'vuex';

declare module '@jiaminghi/data-view' {
  const dataV: any;
  export default dataV;
}
declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
declare module '@tresjs/cientos';