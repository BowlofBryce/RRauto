import { db } from "../../database/connection.js";

export interface PipelineStage {
  id: string;
  business_id: string;
  name: string;
  stage_order: number;
  created_at: string;
}

export async function listPipelineStages(businessId: string): Promise<PipelineStage[]> {
  const { rows } = await db.query<PipelineStage>(
    "SELECT * FROM pipeline_stages WHERE business_id = $1 ORDER BY stage_order ASC",
    [businessId]
  );
  return rows;
}

export async function upsertPipelineStages(
  businessId: string,
  stages: Array<{ name: string; stage_order: number }>
): Promise<PipelineStage[]> {
  await db.query("BEGIN");
  try {
    await db.query("DELETE FROM pipeline_stages WHERE business_id = $1", [businessId]);

    for (const stage of stages) {
      await db.query(
        "INSERT INTO pipeline_stages (business_id, name, stage_order) VALUES ($1, $2, $3)",
        [businessId, stage.name, stage.stage_order]
      );
    }

    await db.query("COMMIT");
    return listPipelineStages(businessId);
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  }
}
