import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Settings</h1>
        <p className="text-sm text-zinc-400 mt-1">
          Manage your account preferences and application settings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-zinc-300">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              Update your name, email, and profile picture. Manage your personal
              information and communication preferences.
            </p>
            <p className="text-xs text-zinc-600 mt-4">Coming soon</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-zinc-300">Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              Configure email and push notification preferences for budget
              alerts, transaction updates, and weekly summaries.
            </p>
            <p className="text-xs text-zinc-600 mt-4">Coming soon</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-zinc-300">Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              Create and manage custom transaction categories with colors and
              icons to better organize your spending.
            </p>
            <p className="text-xs text-zinc-600 mt-4">Coming soon</p>
          </CardContent>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900">
          <CardHeader>
            <CardTitle className="text-zinc-300">Data &amp; Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-zinc-500">
              Export your data, manage connected services, and control your
              privacy settings.
            </p>
            <p className="text-xs text-zinc-600 mt-4">Coming soon</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
