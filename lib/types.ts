export type Role = "guest" | "student" | "organizer" | "admin";
export type Visibility = "public" | "campus" | "members";

export type Club = {
  id: string;
  name: string;
  category: string;
  description: string;
  color: string;
  members: number;
  verified: boolean;
};

export type CampusEvent = {
  id: string;
  title: string;
  description: string;
  clubId: string;
  category: string;
  startsAt: string;
  endsAt: string;
  location: string;
  latitude: number;
  longitude: number;
  visibility: Visibility;
  capacity: number;
  attendees: number;
  image: string;
  featured?: boolean;
};

export type Notice = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};
