import { drizzle } from "drizzle-orm/neon-serverless";
import { sql } from "drizzle-orm";
import ws from "ws";
import * as schema from "@db/schema";

// Maximum number of retries for database connection
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

async function createDbConnection(retryCount = 0) {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?",
      );
    }

    const db = drizzle({
      connection: process.env.DATABASE_URL,
      schema,
      ws: ws,
    });

    // Test the connection
    await db.execute(sql`SELECT 1`);
    console.log('Database connection established successfully');
    return db;
  } catch (error) {
    console.error(`Database connection attempt ${retryCount + 1} failed:`, error);

    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying in ${RETRY_DELAY}ms...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return createDbConnection(retryCount + 1);
    }

    console.error('Max retries reached. Could not establish database connection');
    throw error;
  }
}

let dbInstance: ReturnType<typeof drizzle> | null = null;

// Lazy initialization of database connection
export async function getDb() {
  if (!dbInstance) {
    try {
      dbInstance = await createDbConnection();
    } catch (error) {
      console.error('Failed to establish database connection:', error);
      throw error;
    }
  }
  return dbInstance;
}

// Initialize database connection
const db = await getDb().catch(error => {
  console.error('Failed to establish initial database connection:', error);
  process.exit(1);
});

export { db };