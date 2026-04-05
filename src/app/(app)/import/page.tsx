import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">CSV Import</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Import transactions from your bank or financial institution
        </p>
      </div>

      <Card className="border-zinc-800 bg-zinc-900">
        <CardContent className="py-16">
          <div className="flex flex-col items-center justify-center text-center">
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
                  d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-zinc-300 mb-2">
              Upload CSV File
            </h3>
            <p className="text-sm text-zinc-500 max-w-md mb-6">
              Drag and drop your CSV file here, or click to browse. Supports
              formats from most major banks and financial institutions.
            </p>
            <div className="border-2 border-dashed border-zinc-700 rounded-xl p-12 w-full max-w-lg hover:border-zinc-600 transition-colors cursor-pointer">
              <p className="text-zinc-500 text-sm">
                Coming soon &mdash; CSV import is under development
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
