// The step-by-step guide (Figma 182:721). Wording and order are the design's own as laid out in its body: 04 RSVP and food, 05 Entry rules,
// and Reports as step 12. The design's "Scan at the gate" step is hidden in the Figma file, so it is not shown; the jump chips follow the same order.
export interface Step {
  n: string;
  chip: string;
  title: string;
  intro: string;
  points: { title: string; text: string }[];
  /** the panel picture; text sits on the left when true */
  textLeft: boolean;
  image: string;
}

const P = (title: string, text: string) => ({ title, text });

export const STEPS: Step[] = [
  { n: "01", chip: "Register or log in", title: "How to register or log in to EventQRapp?", intro: "Start by creating your organizer account or signing in to your existing account.", textLeft: true, image: "step-01.png", points: [
    P("Open EventQRapp and get started", "Visit the EventQRapp website and select the option to create an account or sign in."),
    P("Sign in with Google in one click", "No new password to remember. Use your Google account to sign up or log in to EventQRapp instantly and start creating your event."),
    P("Access your organizer dashboard", "After signing in, you'll reach your dashboard, where you can start creating and managing events."),
  ] },
  { n: "02", chip: "Create your event", title: "How to create your first event?", intro: "Set up your event by adding the essential information your guests need to know.", textLeft: false, image: "step-02.png", points: [
    P("Start a new event", "Open your organizer dashboard and select the option to create a new event."),
    P("Enter your event details", "Add the event name, category, description, date, time, and other required information."),
    P("Set your event location", "Enter the venue address and verify its location on the map to help guests find your event."),
  ] },
  { n: "03", chip: "Choose a template", title: "How to choose or upload an invitation template?", intro: "Select an invitation design that matches your event or upload your own custom artwork.", textLeft: true, image: "step-03.png", points: [
    P("Browse invitation templates", "Explore available designs organized by event categories and choose one that suits your occasion."),
    P("Upload your own design", "Already have an invitation card? Upload your custom design in a supported format and use it for your event."),
    P("Preview your invitation", "Check how your selected design looks on a mobile screen before moving to the next step."),
  ] },
  { n: "04", chip: "RSVP and food", title: "How to set RSVP and food preferences?", intro: "Collect guest responses and meal preferences before the event begins.", textLeft: false, image: "step-05.png", points: [
    P("Enable RSVP collection", "Allow invited guests to confirm their attendance and specify a deadline for receiving responses."),
    P("Add food preference options", "Include meal choices, such as vegetarian or non-vegetarian, so guests can select their preferred option."),
    P("Save your preferences", "Review the RSVP and food preference settings before continuing with your event setup."),
  ] },
  { n: "05", chip: "Entry rules", title: "How to set attendee limits and entry rules?", intro: "Configure attendance restrictions and entry permissions to manage your event smoothly.", textLeft: true, image: "step-04.png", points: [
    P("Set attendee limits", "Specify the maximum number of attendees allowed to enter your event based on your venue capacity."),
    P("Configure entry permissions", "Choose the entry conditions for guests based on their invitation and RSVP status."),
    P("Review your event rules", "Check your attendance limits and access settings to ensure everything matches your event requirements."),
  ] },
  { n: "06", chip: "Sessions", title: "How to add and manage event sessions?", intro: "Organize multiple functions within one event and manage guest access separately.", textLeft: false, image: "step-06.png", points: [
    P("Add a new session", "Create sessions for different functions, such as the main ceremony, dinner, or reception."),
    P("Configure session details", "Enter each session's name, schedule, and relevant entry permissions."),
    P("Manage multiple sessions", "Add additional sessions as required and configure their access rules independently."),
  ] },
  { n: "07", chip: "Upload guests", title: "How to download the sample Excel sheet and upload guests?", intro: "Prepare and upload your guest information using the provided Excel template.", textLeft: true, image: "step-07.png", points: [
    P("Download the sample Excel sheet", "Get the sample guest list template to understand the required columns and information format."),
    P("Enter guest information", "Fill in guest names, email addresses, mobile numbers, and applicable session access details."),
    P("Upload your completed guest list", "Upload the Excel file to EventQRapp to import guest information into your event."),
  ] },
  { n: "08", chip: "Review guest list", title: "How to preview and correct your guest list?", intro: "Review your uploaded guest information and make corrections before finalizing your event.", textLeft: false, image: "step-08.png", points: [
    P("Preview uploaded guests", "Check the imported guest list to verify names, contact details, and session assignments."),
    P("Edit incorrect information", "Correct guest names, email addresses, mobile numbers, or other details that need updating."),
    P("Remove unwanted entries", "Delete duplicate or unnecessary guest records, where supported, before completing the event setup."),
  ] },
  { n: "09", chip: "Pay", title: "How to review event costs and complete payment?", intro: "Verify your event details and complete the required payment before sending invitations.", textLeft: true, image: "step-09.png", points: [
    P("Review your event summary", "Check the event information, guest count, sessions, and invitation settings before proceeding."),
    P("Check invitation charges", "Review the total invitation cost, including applicable taxes, based on your event requirements."),
    P("Complete your payment", "Proceed to the secure payment process to complete the required payment before sending invitations."),
  ] },
  { n: "10", chip: "Send invitations", title: "How to send QR invitations to your guests?", intro: "Distribute personalized QR code invitations and monitor their delivery status.", textLeft: false, image: "step-10.png", points: [
    P("Review invitations before sending", "Verify guest information and invitation settings to avoid sending incorrect details."),
    P("Send invitations to guests", "Send personalized QR code invitations through email and WhatsApp to your selected guest list."),
    P("Track invitation delivery", "Check invitation statuses and resend failed invitations when necessary."),
  ] },
  { n: "11", chip: "Assign staff", title: "How to add and assign event staff?", intro: "Prepare your event entry team by assigning staff members to the relevant sessions.", textLeft: true, image: "step-11.png", points: [
    P("Add event staff members", "Enter the required staff information to create accounts for your event entry team."),
    P("Assign events and sessions", "Select which events and sessions each staff member is responsible for managing."),
    P("Prepare staff for guest check-in", "Ensure assigned staff members can access the appropriate scanning tools before the event begins."),
  ] },
  { n: "12", chip: "Reports", title: "How to track attendance and download event reports?", intro: "Monitor guest attendance and review important event information from your dashboard.", textLeft: false, image: "step-13.png", points: [
    P("View event attendance", "Open the event dashboard to check how many invited guests have attended."),
    P("Monitor session check-ins", "Review attendance information for individual sessions to understand guest participation."),
    P("Download event reports", "Access the available event reports and download attendance records for future reference."),
  ] },
];
