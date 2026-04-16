import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',

        include: ['**/tests/**/*.test.ts'],

        setupFiles: [path.resolve(__dirname, 'vitest.setup.ts')],

        coverage: {
            reporter: ['text', 'html'],
        },
    },

    resolve: {
        alias: {
            '@hookrelay/db': path.resolve(__dirname, 'packages/db/src'),
            '@hookrelay/lib': path.resolve(__dirname, 'packages/lib/src'),
            '@hookrelay/config': path.resolve(__dirname, 'packages/config/src'),
            '@hookrelay/queue': path.resolve(__dirname, 'packages/queue/src'),
        },
    },
});