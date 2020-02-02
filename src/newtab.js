import App from './NewTab.svelte';

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

export default app;