import { getSession } from "next-auth/react";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (req.method === "POST") {
    const newRecord = await fetch(`${process.env.BACKEND_URL}/records`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    }).then((r) => r.json());
    res.json(newRecord);
  }
}
