export interface InviteeLog {
  id: string;
  name: string;
  mobile: string;
  /** how many people the guest's pass admits, and the most that entered any one session */
  guestCount: number;
  guestsIn: number;
  invitationStatus: "Sent" | "Pending" | "Failed";
  /** "Not requested" when the event does not use RSVP (shown as the "--" placeholder) */
  rsvpStatus: "Accepted" | "Pending" | "Declined" | "Not requested";
  checkInStatus: "Checked-in" | "Not Checked-in" | "Partially Checked-in";
  lastCheckInTime: string;
  // sessionId -> whether the invitee checked in to that session
  sessionCheckIns: Record<string, boolean>;
  /** the guest's additional information, for the export */
  details?: { companyName: string; professionalIdentity: string; secondaryIdentity: string };
}

export interface ReportSessionColumn {
  id: string;
  name: string;
}

export interface AccessLog {
  id: string;
  userType: string;
  dateTime: string;
  action: string;
  status: "Successful" | "failed";
  /** the organizer the action belongs to: organisation name (or their name), and their ID */
  organizerName: string;
  organizerCode: string;
}

export interface SessionReport {
  id: number;
  name: string;
  dateTime: string;
  invitees: number;
  attendees: number;
  /** people who entered out of the people the passes admit, as text */
  guestsIn: string;
  accessControl: string;
  systemUsers: string;
}
