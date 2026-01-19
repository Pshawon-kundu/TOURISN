# 🚀 QUICK REFERENCE - Admin Commands

## 📋 Essential SQL Commands

### View All User Statuses

```sql
SELECT
  full_name,
  email,
  status,
  nid_verified,
  created_at
FROM users
ORDER BY created_at DESC;
```

### Count Users by Status

```sql
SELECT
  status,
  COUNT(*) as count
FROM users
GROUP BY status;
```

### Find Pending Approvals

```sql
SELECT
  full_name,
  email,
  nid_number,
  created_at
FROM users
WHERE status = 'pending'
ORDER BY created_at ASC;
```

### Find Users Without NID

```sql
SELECT
  full_name,
  email,
  status
FROM users
WHERE nid_number IS NULL
ORDER BY created_at DESC;
```

### Manually Approve User

```sql
UPDATE users
SET status = 'active',
    updated_at = NOW()
WHERE email = 'user@example.com';
```

### Manually Suspend User

```sql
UPDATE users
SET status = 'suspended',
    updated_at = NOW()
WHERE email = 'user@example.com';
```

### Verify NID Manually

```sql
UPDATE users
SET nid_verified = true,
    nid_verification_date = NOW()
WHERE email = 'user@example.com';
```

## 🎯 Admin Panel Quick Actions

### Approve Pending User

1. Click **Pending** filter
2. Find user
3. Click **View Details**
4. Click **✓ Approve User**

### Suspend Active User

1. Click **Active** filter
2. Find user
3. Click **View Details**
4. Click **🚫 Suspend User**
5. Confirm

### Activate Suspended User

1. Click **Suspended** filter
2. Find user
3. Click **View Details**
4. Click **✓ Activate User**

### Verify NID

1. Find user in any filter
2. Click **View Details**
3. Click **View NID Image** (if needed)
4. Click **✓ Verify NID**

## 🔧 Backend Commands

### Start Backend Server

```bash
cd backend
npm run dev
```

### Test OCR Endpoint

```bash
curl -X POST http://localhost:5001/api/nid/extract \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://your-supabase-url/storage/v1/..."
  }'
```

### Check Server Health

```bash
curl http://localhost:5001/api/health
```

## 📱 Frontend Commands

### Start Mobile App

```bash
npm start
```

### Clear Metro Cache

```bash
npm start -- --reset-cache
```

### Start Admin Web

```bash
cd admin-web
npm run dev
```

## 🗄️ Supabase Commands

### Get User by Email

```javascript
const { data, error } = await supabase
  .from("users")
  .select("*")
  .eq("email", "user@example.com")
  .single();
```

### Update User Status

```javascript
const { error } = await supabase
  .from("users")
  .update({ status: "active" })
  .eq("id", userId);
```

### Get All Pending Users

```javascript
const { data, error } = await supabase
  .from("users")
  .select("*")
  .eq("status", "pending")
  .order("created_at", { ascending: false });
```

### Count Users by Status

```javascript
const { count: activeCount } = await supabase
  .from("users")
  .select("*", { count: "exact", head: true })
  .eq("status", "active");
```

## 🔍 Debugging Commands

### Check User Status

```sql
SELECT id, email, status, nid_verified
FROM users
WHERE email = 'user@example.com';
```

### View Recent Signups

```sql
SELECT full_name, email, status, created_at
FROM users
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
```

### Find Unverified NIDs

```sql
SELECT full_name, email, nid_number
FROM users
WHERE nid_number IS NOT NULL
  AND nid_verified = false;
```

### Check Storage Usage

```sql
SELECT
  bucket_id,
  COUNT(*) as file_count,
  SUM(metadata->>'size')::bigint as total_size
FROM storage.objects
GROUP BY bucket_id;
```

## 🚨 Emergency Commands

### Activate All Pending Users (Bulk)

```sql
UPDATE users
SET status = 'active',
    updated_at = NOW()
WHERE status = 'pending';
```

### Reset User Status

```sql
UPDATE users
SET status = 'active',
    updated_at = NOW()
WHERE id = 'user-uuid-here';
```

### Clear Suspended Status (All)

```sql
UPDATE users
SET status = 'active',
    updated_at = NOW()
WHERE status = 'suspended';
```

## 📊 Reporting Queries

### Daily Signup Report

```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as signups,
  COUNT(*) FILTER (WHERE nid_verified = true) as verified_nid
FROM users
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Status Distribution

```sql
SELECT
  status,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM users
GROUP BY status;
```

### Verification Rate

```sql
SELECT
  COUNT(*) as total_with_nid,
  COUNT(*) FILTER (WHERE nid_verified = true) as verified,
  ROUND(COUNT(*) FILTER (WHERE nid_verified = true) * 100.0 / COUNT(*), 2) as verification_rate
FROM users
WHERE nid_number IS NOT NULL;
```

## 🔑 Admin Panel Shortcuts

| Action         | Shortcut                 |
| -------------- | ------------------------ |
| View All Users | Click "All Users"        |
| View Active    | Click "Active"           |
| View Pending   | Click "Pending"          |
| View Suspended | Click "Suspended"        |
| User Details   | Click "View Details"     |
| NID Image      | Click "View NID"         |
| Close Modal    | Click "Close" or outside |

## 📝 Status Values

| Status      | Meaning               | Color     |
| ----------- | --------------------- | --------- |
| `active`    | Approved, full access | Green 🟢  |
| `pending`   | Awaiting approval     | Yellow 🟡 |
| `suspended` | Blocked access        | Red 🔴    |

## 🎯 Common Tasks

### Task: Approve Multiple Users

```sql
UPDATE users
SET status = 'active',
    updated_at = NOW()
WHERE status = 'pending'
  AND created_at > '2026-01-01';
```

### Task: Find Duplicate NIDs

```sql
SELECT
  nid_number,
  COUNT(*) as count,
  STRING_AGG(email, ', ') as emails
FROM users
WHERE nid_number IS NOT NULL
GROUP BY nid_number
HAVING COUNT(*) > 1;
```

### Task: Export User Data

```sql
COPY (
  SELECT
    full_name,
    email,
    status,
    nid_number,
    nid_verified,
    created_at
  FROM users
  ORDER BY created_at DESC
) TO '/tmp/users_export.csv' CSV HEADER;
```

---

**Quick Help**: For full documentation, see:

- `SYSTEM_OVERVIEW.md` - Complete system guide
- `ADMIN_USER_MANAGEMENT_GUIDE.md` - Admin panel details
- `NID_VERIFICATION_ADMIN_GUIDE.md` - NID system details
