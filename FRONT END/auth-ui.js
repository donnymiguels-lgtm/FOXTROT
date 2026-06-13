const authToken =
localStorage.getItem("token");

// AUTH GUARD

if(!authToken){

window.location.replace(
"login.html"
);

}

// LOAD CURRENT USER

async function loadCurrentUser(){

try{

const response =
await fetch(

"http://localhost:5000/api/auth/me",

{
headers:{
Authorization:
`Bearer ${authToken}`
}
}

);

if(!response.ok){

localStorage.removeItem("token");
localStorage.removeItem("user");

window.location.replace(
"login.html"
);

return;

}

const user =
await response.json();

updateNavbar(user);

await showOfficerPanelIfAllowed();

}
catch(error){

console.log(error);

localStorage.removeItem("token");
localStorage.removeItem("user");

window.location.replace(
"login.html"
);

}

}

// UPDATE NAVBAR

function updateNavbar(user){

const badge =
document.getElementById(
"roleText"
);

const profile =
document.getElementById(
"profileInitials"
);

if(badge){

badge.textContent =
capitalize(
user.role
);

}

if(profile){

profile.textContent =
user.name
.split(" ")
.map(part=>
part[0]
)
.join("")
.slice(0,2)
.toUpperCase();

}

}

// OFFICER PANEL LINK

async function showOfficerPanelIfAllowed(){

try{

const response =
await fetch(

"http://localhost:5000/api/organizations/my-organizations",

{
headers:{
Authorization:
`Bearer ${authToken}`
}
}

);

if(!response.ok){

return;

}

const organizations =
await response.json();

const officerRoles =
[
"president",
"vice_president",
"secretary",
"treasurer",
"officer"
];

const isOfficer =
organizations.some(org=>
officerRoles.includes(
org.organization_role
)
);

if(!isOfficer){

return;

}

const navLinks =
document.querySelector(
".nav-links"
);

if(!navLinks){

return;

}

const alreadyExists =
document.getElementById(
"officerPanelLink"
);

if(alreadyExists){

return;

}

navLinks.innerHTML += `

<a href="officer.html" id="officerPanelLink">
<i class="fa-solid fa-user-tie"></i>
<span>Officer Panel</span>
</a>

`;

}
catch(error){

console.log(error);

}

}

// CAPITALIZE

function capitalize(str){

if(!str){

return "";

}

return str.charAt(0).toUpperCase() +
str.slice(1);

}

// LOGOUT

const logoutBtn =
document.getElementById(
"logoutBtn"
);

if(logoutBtn){

logoutBtn.addEventListener(
"click",
()=>{

localStorage.removeItem(
"token"
);

localStorage.removeItem(
"user"
);

window.location.replace(
"login.html"
);

}
);

}

// HANDLE BROWSER BACK CACHE

window.addEventListener(
"pageshow",
(event)=>{

const token =
localStorage.getItem(
"token"
);

if(
event.persisted ||
!token
){

if(!token){

window.location.replace(
"login.html"
);

}

}

}
);

// START

loadCurrentUser();