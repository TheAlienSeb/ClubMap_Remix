import EventPage from "@/app/components/EventPage";
import React from "react";

const page = async ({ params }: { params: Promise<{ eventID: string }> }) => {
  const { eventID } = await params;
  return (
    <div>
      <EventPage eventId={eventID} />
    </div>
  );
};

export default page;
