const dev = process.env.NODE_ENV === 'development';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    kit: {
        paths: {
            base: dev ? '' : '/Cupcake_Store'
        }
    }
};

export default config;