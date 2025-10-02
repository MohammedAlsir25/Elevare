import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
});

pool.on('connect', () => {
    console.log('Successfully connected to the PostgreSQL database.');
});

pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    // FIX: Cast `process` to `any` to resolve 'Property 'exit' does not exist on type 'Process'' error. This is a workaround for a likely type definition issue in the environment where the standard Node.js `process.exit` method is not recognized.
    (process as any).exit(-1);
});

// Export a query method so the rest of the application doesn't need to interact with the pool directly
export default {
    query: (text: string, params?: any[]) => pool.query(text, params),
};