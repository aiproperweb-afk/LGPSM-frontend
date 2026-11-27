// Keep event copy within the space available in the invitation layouts.
// These limits are for the web creation/editing forms; the API remains authoritative.
export const EVENT_TITLE_MAX_LENGTH = 50;
export const EVENT_DESCRIPTION_MAX_LENGTH = 180;
// The venue line on the invitation card wraps to at most two lines
export const EVENT_LOCATION_MAX_LENGTH = 50;
// Food preference questions and their choices: short enough to read in the invitee list and on the invitation page (the API's limits)
export const FOOD_TITLE_MAX_LENGTH = 40;
export const FOOD_OPTION_MAX_LENGTH = 30;
