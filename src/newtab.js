import { mount } from 'svelte'
import App from "./Newtab.svelte";

const app = mount(App, {
  target: document.body,
})

export default app