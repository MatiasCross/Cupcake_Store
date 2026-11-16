import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        paths: {
            // Lê do ambiente. No GitHub Actions, definiremos BASE_PATH como '/Cupcake_Store'
            base: process.env.BASE_PATH || ''
        },
        adapter: adapter({
            fallback: '404.html'
        })
    }
};

export default config;