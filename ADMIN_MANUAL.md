
---

## 🛠️ `ADMIN_MANUAL.md`

```markdown
# OrgHub Admin Manual

## 📌 Introduction
This manual provides instructions for administrators managing users, organizations, and events in the OrgHub system.  
Admins have full control over approvals, deletions, and system monitoring.

---

## 🧩 Data Extracted From
OrgHub’s administrative dashboard aggregates data from:
- **Users** – for account management and role assignment.
- **Organizations** – for approval and category tracking.
- **Events** – for scheduling and validation.
- **Memberships** – for monitoring participation and member counts.
- **Announcements** – for reviewing and moderating published updates.

---

## 👤 User Administration
- **Approve Role Changes**: Promote/demote users (e.g., officer → admin).  
- **Remove User**: Delete inactive or invalid accounts.  

---

## 🏛️ Organization Management
- **Approve/Reject Requests**: Validate new organization submissions.  
- **Remove Organization**: Delete inactive or invalid groups.  

---

## 🎉 Event Oversight
- **Approve Events**: Validate event details before publishing.  
- **Delete Events**: Remove canceled or invalid events.  

---

## 📊 System Monitoring
- **View Logs**: Track user actions and system transactions.  
- **Transaction Processing**: Ensure ACID compliance with commit/rollback handling.  

---

## 🧪 Example SQL Queries (Admin Context)
```sql
-- Approve organization request
UPDATE organization_requests
SET status = 'approved'
WHERE request_id = 1;

-- Promote user to admin
UPDATE users
SET system_role = 'admin'
WHERE user_id = 15;

-- Approve event
UPDATE events
SET status = 'approved'
WHERE event_id = 3;

-- Delete organization
DELETE FROM organizations
WHERE organization_id = 10;
