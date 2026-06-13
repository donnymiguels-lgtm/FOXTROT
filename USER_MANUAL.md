# OrgHub User Manual

## 📌 Introduction
This manual provides guidance for students and organization members using the OrgHub system.  
It explains how to register, manage profiles, join organizations, and participate in events.

---

## 🔑 Login & Registration
- **Register Account**: Fill in username, email, and password to create an account.  
- **Login**: Enter credentials to access the dashboard.  

---

## 👤 Profile Management
- **View Profile**: Displays user details and assigned role.  
- **Update Role**: Request role changes (e.g., member → officer).  

---

## 🏛️ Organization Access
- **View Organizations**: Browse approved organizations.  
- **Join Organization**: Submit membership request for approval.  

---

## 🎉 Event Participation
- **View Events**: See upcoming and approved events.  
- **Register for Event**: Sign up for participation.  

---

## 🧪 Example SQL Queries (User Context)
```sql
-- Register new user
INSERT INTO users (username, email, system_role)
VALUES ('jdoe', 'jdoe@cvsu.edu.ph', 'member');

-- View user profile
SELECT user_id, username, system_role FROM users
WHERE user_id = 15;

-- Request role update
UPDATE users
SET system_role = 'officer'
WHERE user_id = 15;
