import { mount } from 'svelte'
import App from "./Popup.svelte";

const app = mount(App, {
  target: document.body,
})

export default app