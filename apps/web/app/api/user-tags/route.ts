import { getUserTags } from "@/lib/db/queries";

export async function GET() {
  const userTags = await getUserTags();
  return Response.json(userTags);
}
