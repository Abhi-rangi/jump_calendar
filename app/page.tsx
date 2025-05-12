import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Calendar, Clock, Users } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  try {
    const user = await getCurrentUser();

    if (user) {
      redirect("/dashboard");
    }
  } catch (error) {
    console.error("Authentication error:", error);
    // Continue rendering the home page even if authentication fails
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-white">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">AdvisorConnect</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/auth/signin">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/auth/signin">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-gradient-to-b from-white to-gray-50 py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              Connect with your clients{" "}
              <span className="text-primary">effortlessly</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              The ultimate scheduling tool for advisors. Streamline your client
              meetings and integrate with your existing tools.
            </p>
            <div className="mt-10">
              <Button size="lg" asChild>
                <Link href="/auth/signin">Start scheduling now</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 mb-12">
              Key Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-medium mb-2">
                  Calendar Integration
                </h3>
                <p className="text-center text-gray-600">
                  Connect multiple Google Calendars to manage all your
                  availability in one place.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
                <Users className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-medium mb-2">CRM Connection</h3>
                <p className="text-center text-gray-600">
                  Seamlessly integrate with Hubspot to keep your client
                  information up to date.
                </p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
                <Clock className="h-12 w-12 text-primary mb-4" />
                <h3 className="text-xl font-medium mb-2">Smart Scheduling</h3>
                <p className="text-center text-gray-600">
                  Create custom scheduling links with advanced settings and
                  personalized questions.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2023 AdvisorConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
