import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="recipe-page flex flex-col items-center justify-center min-h-screen text-center px-6">
      <div className="max-w-md py-16">
        <p className="eyebrow justify-center mb-4">404 · Recipe Not Found</p>
        <h1 className="font-serif text-4xl mb-4 text-[#1a2017]">A quiet corner of the kitchen.</h1>
        <p className="text-[#596151] text-sm mb-8 leading-relaxed">
          We couldn&apos;t find the recipe you were looking for. Let&apos;s head back to Ivy&apos;s kitchen and find something delicious.
        </p>
        <Link href="/" className="start-cooking-btn inline-flex items-center gap-2">
          <ArrowLeft size={16} /> Return to Discovery
        </Link>
      </div>
    </main>
  );
}
