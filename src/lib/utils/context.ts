import { db } from "@/lib/db";
import { sql } from "drizzle-orm";

type TransactionClient = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Executes a database operation within a transaction where `app.current_user_id`
 * is scoped locally. When the transaction commits or rolls back, PostgreSQL
 * automatically clears the setting, ensuring no session contamination across
 * pooled connections.
 */
export async function withUserContext<T>(
  userId: string,
  callback: (tx: TransactionClient) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    // Sanitize userId to prevent SQL injection in raw SET LOCAL
    const safeUserId = userId.replace(/'/g, "''");
    await tx.execute(sql.raw(`SET LOCAL app.current_user_id = '${safeUserId}';`));
    return await callback(tx);
  });
}
