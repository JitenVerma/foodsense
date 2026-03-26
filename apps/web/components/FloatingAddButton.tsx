import Link from "next/link";

export function FloatingAddButton() {
  return (
    <Link
      href="/analyze"
      className="arcade-button-primary fixed bottom-6 right-6 z-[var(--z-sticky)] px-5 py-4 md:bottom-8 md:right-8 xl:hidden"
    >
      + Add Meal
    </Link>
  );
}
