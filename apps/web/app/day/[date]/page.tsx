import { DailyDetailPageClient } from "../../../components/DailyDetailPageClient";

export default async function DailyDetailPage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;

  return <DailyDetailPageClient date={date} />;
}
