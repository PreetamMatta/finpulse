import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function GoalsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Goals</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Set financial goals and track your progress
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-300">Financial Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="size-16 rounded-full bg-zinc-800 flex items-center justify-center mb-4">
              <svg
                className="size-8 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-300 mb-2">
              Coming Soon
            </h3>
            <p className="text-sm text-zinc-500 max-w-md">
              Define savings goals, track your progress with visual indicators,
              and get personalized recommendations to reach your targets faster.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
