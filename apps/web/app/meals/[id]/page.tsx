import { MealDetailPageClient } from "../../../components/MealDetailPageClient";

export default async function MealDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <MealDetailPageClient mealId={id} />;
}
