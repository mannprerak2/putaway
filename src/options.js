import { mount } from 'svelte'
import App from "./Options.svelte";

const app = mount(App, {
  target: document.body,
})

export default app