import adapter from '@sveltejs/adapter-static';

const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        // 1. Adaptador para gerar arquivos estáticos
        adapter: adapter({
            pages: 'build',
            assets: 'build',
            fallback: 'index.html' // Opcional, útil para SPAs
        }),
        
        // 2. Caminho base para o GitHub Pages
        paths: {
            
            base: dev ? '' : '/Cupcake_Store'
        }
    }
};

export default config;