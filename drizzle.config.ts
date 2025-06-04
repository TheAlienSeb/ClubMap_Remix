import type {Config} from 'drizzle-kit';
import * as dotenv from  'dotenv';
dotenv.config({path: ".env.local"});


if(!process.env.DATABASE_URL){
    console.log('Cannot find Database URL')
}

export default {
    schema: './lib/supabase/schema.ts',
    out: './migrations',
    dialect: 'postgresql',
    dbCredentials: {
        connectionString: process.env.DATABASE_URL || '',

    }

}