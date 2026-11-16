import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        adapter: adapter({
            fallback: 'index.html' // Permite que rotas dinâmicas funcionem no cliente
        })
    }
};

export default config;