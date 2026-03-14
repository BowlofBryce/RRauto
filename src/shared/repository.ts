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

export async function listByBusiness<T extends Record<string, unknown> = Record<string, unknown>>(
  table: string,
  businessId: string
): Promise<T[]> {
  const { rows } = await db.query<T>(
    `SELECT * FROM ${table} WHERE business_id = $1 ORDER BY created_at DESC`,
    [businessId]
  );
  return rows;
}

export async function updateRecord<T extends Record<string, unknown> = Record<string, unknown>>(
  table: string,
  id: string,
  businessId: string,
  payload: Record<string, unknown>
): Promise<T | null> {
  const keys = Object.keys(payload);
  if (keys.length === 0) return null;

  const sets = keys.map((k, i) => `${k} = $${i + 3}`).join(", ");
  const values = [id, businessId, ...Object.values(payload)];

  const { rows } = await db.query<T>(
    `UPDATE ${table} SET ${sets} WHERE id = $1 AND business_id = $2 RETURNING *`,
    values
  );
  return rows[0] ?? null;
}

export async function deleteRecord(
  table: string,
  id: string,
  businessId: string
): Promise<boolean> {
  const { rows } = await db.query<{ id: string }>(
    `DELETE FROM ${table} WHERE id = $1 AND business_id = $2 RETURNING id`,
    [id, businessId]
  );
  return rows.length > 0;
}

export async function getById<T extends Record<string, unknown> = Record<string, unknown>>(
  table: string,
  id: string,
  businessId: string
): Promise<T | null> {
  const { rows } = await db.query<T>(
    `SELECT * FROM ${table} WHERE id = $1 AND business_id = $2`,
    [id, businessId]
  );
  return rows[0] ?? null;
}
