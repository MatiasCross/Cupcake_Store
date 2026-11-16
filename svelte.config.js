import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        paths: {
            
            base: process.env.NODE_ENV === 'production' ? '/Cupcake_Store' : ''
        },
        adapter: adapter({
            fallback: '404.html'
        })
    }
};

export default config;