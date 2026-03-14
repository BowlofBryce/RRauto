import { db } from "../database/connection.js";

export async function createRecord<T extends Record<string, unknown> = Record<string, unknown>>(
  table: string,
  businessId: string,
  payload: Record<string, unknown>
): Promise<T> {
  const columns = ["business_id", ...Object.keys(payload)];
  const values = [businessId, ...Object.values(payload)];
  const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

  const query = `
    INSERT INTO ${table} (${columns.join(", ")})
    VALUES (${placeholders})
    RETURNING *
  `;

  const { rows } = await db.query<T>(query, values);
  return rows[0];
}

export async function listByBusiness<T extends Record<string, unknown> = Record<string, unknown>>(table: string, businessId: string): Promise<T[]> {
  const { rows } = await db.query<T>(`SELECT * FROM ${table} WHERE business_id = $1 ORDER BY created_at DESC`, [businessId]);
  return rows;
}
