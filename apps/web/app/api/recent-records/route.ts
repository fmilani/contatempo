import { getRecentRecords } from "@/lib/db/queries";

export async function GET() {
  const recentRecords = await getRecentRecords();
  return Response.json(recentRecords);
}
