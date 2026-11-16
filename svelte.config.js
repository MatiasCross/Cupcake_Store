const dev = process.env.NODE_ENV === 'development';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        paths: {
            base: dev ? '' : '/Cupcake_Store'
        },
        adapter: adapter({
            fallback: 'index.html' // Permite que rotas dinâmicas funcionem no cliente
        })
    }
};

export default config;