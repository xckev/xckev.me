import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MONGODB_URI environment variable");

// Module-level singleton so the connection is reused across hot-reloads in dev
// and across serverless function invocations in production.
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  if (!global._mongoClientPromise) {
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  const client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;

/** Returns the journal database */
export async function getJournalDb() {
  const client = await clientPromise;
  const dbName = process.env.MONGODB_DB_NAME ?? "journal";
  const db = client.db(dbName);
  await ensureIndexes(db);
  return db;
}

// Track whether indexes have been verified this process lifetime
// to avoid calling createIndex on every request.
let indexesEnsured = false;

/**
 * Creates indexes required by the journal.
 * - { date: -1 } on journal_entries: makes the sort({ date: -1 }) index-backed,
 *   bypassing MongoDB's 32 MB in-memory sort limit regardless of collection size.
 *
 * createIndex is idempotent — safe to call on a collection that already has the index.
 */
async function ensureIndexes(db: import("mongodb").Db) {
  if (indexesEnsured) return;
  await db
    .collection("journal_entries")
    .createIndex({ date: -1 }, { background: true });
  indexesEnsured = true;
}
