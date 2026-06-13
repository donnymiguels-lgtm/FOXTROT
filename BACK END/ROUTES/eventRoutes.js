const express =
require("express");

const router =
express.Router();

const {

createEvent,
getEvents,
approveEvent,
getEventRequests,
registerEvent,
cancelRegistration,
getMyEvents,
getMyOrganizationEvents,
getEventRegistrations,
markAttendance,
getAttendanceSummary,
getMyAttendanceRate,
getEventDetails,
rejectEvent

}=require(
"../controllers/eventController"
);

const {

verifyToken

}=require(
"../middleware/authMiddleware"
);

const {

allowRoles

}=require(
"../middleware/roleMiddleware"
);

// CREATE EVENT
// Permission is checked inside eventController.js
// using organization_members.organization_role
router.post(

"/",

verifyToken,

createEvent

);

// MY EVENTS
router.get(

"/my-events",

verifyToken,

getMyEvents

);

// ADMIN EVENT REQUESTS
router.get(

"/requests",

verifyToken,

allowRoles("admin"),

getEventRequests

);

// APPROVE EVENT
router.put(

"/:id/approve",

verifyToken,

allowRoles("admin"),

approveEvent

);

// REJECT

router.put(

"/:id/reject",

verifyToken,

allowRoles("admin"),

rejectEvent

);



// REGISTER EVENT

router.get(

"/my-organization-events",

verifyToken,

getMyOrganizationEvents

);

router.get(

"/:id/details",

getEventDetails

);

router.get(

"/:id/registrations",

verifyToken,

getEventRegistrations

);

router.get(

"/:id/details",

getEventDetails

);

router.post(

"/:id/register",

verifyToken,

registerEvent

);


// CANCEL REGISTRATION
router.delete(

"/:id/register",

verifyToken,

cancelRegistration

);

// PUBLIC APPROVED EVENTS

router.get(

"/my-attendance-rate",

verifyToken,

getMyAttendanceRate

);

router.get(

"/",

getEvents

);

router.get(

"/:id/registrations",

verifyToken,

getEventRegistrations

);

router.put(

"/registrations/:id/attendance",

verifyToken,

markAttendance

);

router.get(

"/:id/attendance-summary",

verifyToken,

getAttendanceSummary

);

module.exports =
router;