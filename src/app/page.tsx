import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <main className={cn("flex min-h-screen flex-col items-center justify-center")}>
      <h1 className="text-4xl font-bold">Explain RFC</h1>
      <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
        Interactive RFC Learning Platform
      </p>
    </main>
  );
}
