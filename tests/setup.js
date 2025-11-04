import { vi } from 'vitest';

vi.mock('../src/config/env.js', () => ({
    config: {
        database: {
            host: 'localhost',
            port: 5432,
            database: 'test_db',
            user: 'test_user',
            password: 'test_password'
        },
        jwt: {
            secret: 'test_secret',
            expiresIn: '1h'
        },
        email: {
            host: 'smtp.test.com',
            port: 587,
            user: 'test@test.com',
            password: 'test_password'
        }
    }
}));


global.console = {
    ...console,
    log: vi.fn(),
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
};