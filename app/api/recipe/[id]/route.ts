import { NextResponse } from "next/server";
import { getRecipeData } from "@/lib/recipes/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: rawId } = await context.params;
  const id = Number.parseInt(rawId, 10);

  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid recipe id." }, { status: 400 });
  }

  const recipe = await getRecipeData(id);
  if (!recipe) {
    return NextResponse.json({ error: "This recipe could not be found." }, { status: 404 });
  }

  return NextResponse.json(recipe);
}
