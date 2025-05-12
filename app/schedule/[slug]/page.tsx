import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { ScheduleBookingForm } from "@/components/schedule/schedule-booking-form";

export default async function SchedulePage({
  params,
}: {
  params: { slug: string };
}) {
  const link = await prisma.schedulingLink.findUnique({
    where: { slug: params.slug },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
  });

  if (!link) {
    notFound();
  }

  // Check if the link is expired
  if (link.expirationDate && new Date(link.expirationDate) < new Date()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded shadow text-center">
          <h2 className="text-2xl font-bold mb-2">
            This scheduling link has expired
          </h2>
          <p className="text-muted-foreground">
            You can no longer book a meeting with this link.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg">
          <ScheduleBookingForm link={link} />
        </div>
      </div>
    </div>
  );
}
