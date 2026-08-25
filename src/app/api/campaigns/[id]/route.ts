import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/session";
import {
  getCampaignForUser,
  updateCampaign,
  deleteCampaign,
} from "@/lib/campaigns";

export const runtime = "nodejs";

type Params = { params: { id: string } };

const patchSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  targetUrl: z.string().trim().url().max(1000).optional(),
  status: z.enum(["active", "paused"]).optional(),
});

export async function PATCH(req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid campaign" }, { status: 400 });
  }
  const campaign = await getCampaignForUser(id, user.id);
  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const parsed = patchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Provide a valid name, URL or status" },
      { status: 400 },
    );
  }
  const patch = parsed.data;
  if (patch.targetUrl != null && campaign.type !== "dynamic") {
    return NextResponse.json(
      { error: "Only dynamic codes have an editable destination" },
      { status: 400 },
    );
  }
  await updateCampaign(id, user.id, patch);
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Params) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid campaign" }, { status: 400 });
  }
  const campaign = await getCampaignForUser(id, user.id);
  if (!campaign) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  await deleteCampaign(id, user.id);
  return NextResponse.json({ ok: true });
}
