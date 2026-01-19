# Admin Panel Data Fix

## Problem

Admin panel was showing dummy data instead of real Supabase data. Backend logs showed errors:

- `column users.full_name does not exist`
- `Could not find a relationship between 'bookings' and 'traveler_id'`
- `column guides.full_name does not exist`

## Root Cause

Backend code was trying to query `full_name` column, but the database schema only has `first_name` and `last_name` columns.

## Files Fixed

### 1. Backend Services (`backend/src/services/realtimeService.ts`)

**Changed:**

- `getRecentUsers()`: Now selects `first_name, last_name` instead of `full_name`
- `getRecentBookings()`: Removed invalid foreign key relationships that were causing errors
- `getRecentGuides()`: Changed from `full_name` to `first_name, last_name`

### 2. Backend Admin Routes (`backend/src/routes/admin.ts`)

**Changed:**

- User search query: Now searches `first_name` and `last_name` separately instead of `full_name`
- Pattern: `email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`

### 3. Admin Panel UI (`admin-web/src/pages/UsersPage.tsx`)

**Changed:**

- Interface: Updated `User` interface to have `first_name` and `last_name` instead of `full_name`
- DataTable: Column now renders combined name: `${row.first_name} ${row.last_name}`
- User Details Modal: Shows `{selectedUser.first_name} {selectedUser.last_name}`
- NID Modal: Shows `{selectedUser.first_name} {selectedUser.last_name}`

## Database Schema

```sql
users table:
- first_name (VARCHAR)
- last_name (VARCHAR)
- email (VARCHAR)
- role (VARCHAR)
- nid_number (VARCHAR)
- nid_image_url (TEXT)
- nid_verified (BOOLEAN)
- status (VARCHAR) -- 'active', 'suspended', 'pending'
- phone (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

## Result

✅ Admin panel now correctly fetches and displays real user data from Supabase
✅ No more column errors in backend logs
✅ Users table shows name as combination of first_name + last_name
✅ Search functionality works across email, first_name, and last_name
✅ User details modal displays correct information
✅ NID verification modal shows correct user name

## Services Running

- Backend: http://localhost:5001 ✅
- Admin Panel: http://localhost:4174 ✅
- Frontend: http://localhost:8081 ✅

## Testing

1. Open admin panel at http://localhost:4174
2. Login with admin credentials
3. Navigate to Users page
4. Verify real user data is displayed
5. Test search functionality
6. Click on user to see details modal
7. Check NID verification modal
