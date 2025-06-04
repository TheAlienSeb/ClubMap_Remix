import {drizzle} from 'drizzle-orm/postgres-js'
import {migrate} from 'drizzle-orm/postgres-js/migrator'
import postgres from 'postgres'
import * as dotenv from 'dotenv'
import * as schema from '../../migrations/schema'


dotenv.config({path: '.env.local'});

if(!process.env.DATABASE_URL){
    console.log("Missing the DATABASE URL")
}


const client = postgres(process.env.DATABASE_URL as string, {max:1})
const db = drizzle(client, {schema})

const migrateDB = async () => {
    try {
    console.log("migrating client")
    await migrate(db, {migrationsFolder: "migrations"})
    console.log("Successfully Migrated")
    } catch(error){
        console.log("Migration Failed")
    }
}
migrateDB()
export default db;