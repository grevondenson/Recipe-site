import { notFound } from "next/navigation";
import { RecipeDetail } from "@/components/recipe-detail";
import { getRecipeData } from "@/lib/recipes/service";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const match = /^(\d+)(?:-|$)/.exec(slug);
  if (!match) notFound();

  const id = Number.parseInt(match[1], 10);
  const recipe = await getRecipeData(id);
  if (!recipe) notFound();

  return <RecipeDetail initialRecipe={recipe} />;
}
