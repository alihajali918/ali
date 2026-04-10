import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as { db?: mysql.Pool };

function createPool() {
  const url = process.env.DATABASE_URL!;
  // Parse mysql://user:pass@host:port/db?params
  const match = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/([^?]+)/);
  if (!match) throw new Error("Invalid DATABASE_URL");
  const [, user, password, host, port, database] = match;

  return mysql.createPool({
    host,
    port: parseInt(port),
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit: 2,
    queueLimit: 10,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
  });
}

export const db = globalForDb.db ?? createPool();
globalForDb.db = db;
