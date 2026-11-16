import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        paths: {
            // Usa a variável BASE_PATH se existir, senão usa o caminho fixo em produção
            base: process.env.BASE_PATH || (process.env.NODE_ENV === 'production' ? '/Cupcake_Store' : '')
        },
        adapter: adapter({
            fallback: '404.html'
        })
    }
};

export default config;