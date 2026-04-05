import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function BudgetsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Budgets</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Set and manage spending budgets by category
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardHeader>
          <CardTitle className="text-zinc-300">Budget Management</CardTitle>
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
                  d="M10.5 6a7.5 7.5 0 1 0 7.5 7.5h-7.5V6Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 10.5H21A7.5 7.5 0 0 0 13.5 3v7.5Z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-300 mb-2">
              Coming Soon
            </h3>
            <p className="text-sm text-zinc-500 max-w-md">
              Create monthly budgets by category, track your spending against
              limits, and get alerts when you&apos;re approaching your budget
              thresholds.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
