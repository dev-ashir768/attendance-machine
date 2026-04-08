# 🕐 Automatic Attendance Cron Job Guide

## Overview
Cron jobs automatically process check-in and check-out for all employees at configured times, even without device integration.

## 📋 Features
- ✅ Automatic daily check-in at configured time
- ✅ Automatic daily check-out at configured time
- ✅ Runs only on weekdays (Monday-Friday)
- ✅ Supports any timezone (default: Pakistan Time)
- ✅ Can be enabled/disabled via environment variable
- ✅ Detailed logging for monitoring

## 🔧 Configuration

Add these variables to your `.env` file:

```env
# Enable/Disable automatic check-in/out (true/false)
ENABLE_CRON=true

# Automatic Check-in Time (24-hour format: HH:mm)
CHECK_IN_TIME="09:00"

# Automatic Check-out Time (24-hour format: HH:mm)
CHECK_OUT_TIME="17:00"

# Timezone for Cron Jobs (use standard timezone names)
CRON_TIMEZONE="Asia/Karachi"
```

### Available Timezones
- `Asia/Karachi` - Pakistan
- `Asia/Dubai` - UAE
- `Asia/Kolkata` - India
- `Europe/London` - UK
- `America/New_York` - USA
- [Full list of timezones](https://en.wikipedia.org/wiki/List_of_tz_database_time_zones)

## 🚀 How It Works

### Daily Schedule
1. **09:00 AM** - Automatic check-in for all active employees
2. **05:00 PM** - Automatic check-out for all active employees

### Process Flow
```
Cron Job Triggers
    ↓
Fetch all EMPLOYEE users
    ↓
For each employee:
    - Create check-in/out record
    - Process through attendance service
    - Handle errors gracefully
    ↓
Log results to console
```

### Example Console Output
```
⏰ Check-in cron scheduled: 09:00 (Asia/Karachi)
⏰ Check-out cron scheduled: 17:00 (Asia/Karachi)
[CRON] Processing automatic check-in at 2026-04-08T04:00:00.000Z
✅ Check-in processed for user: Ahmed Khan (2024001)
✅ Check-in processed for user: Fatima Ali (2024002)
```

## 📊 Database Impact

### Records Created
- **AttendanceDaily**: New record for today's date
- **AttendanceSession**: Check-in and check-out timestamps
- **AttendanceLog**: Raw log entries with source="AUTOMATIC_CRON"

### Example Attendance Record
```json
{
  "userId": "user-123",
  "date": "2026-04-08",
  "checkInTime": "2026-04-08T09:00:00Z",
  "checkOutTime": "2026-04-08T17:00:00Z",
  "durationMinutes": 480,
  "source": "AUTOMATIC_CRON"
}
```

## 🛠️ Implementation Details

### Cron Service
Located at: [src/services/cron.service.ts](src/services/cron.service.ts)

**Key Methods:**
- `start()` - Initialize and schedule cron jobs
- `scheduleCheckIn()` - Setup check-in job
- `scheduleCheckOut()` - Setup check-out job
- `processCheckInForAllUsers()` - Execute check-in logic
- `processCheckOutForAllUsers()` - Execute check-out logic
- `stop()` - Stop all running jobs

### Integration
The cron service is automatically started in [src/app.ts](src/app.ts) when the server starts.

```typescript
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  cronService.start(); // ← Starts cron jobs
});
```

## 🔐 Considerations

### Who Gets Auto Check-In/Out?
- Only users with role = `EMPLOYEE`
- Admin users are excluded
- Runs on weekdays only (1-5: Mon-Fri)

### Duplicate Handling
- If user already has check-in/out, system processes new one
- 5-minute duplicate threshold prevents accidental double records
- CRON_JOB source identifier helps tracking

### Timezone Handling
- All times stored in UTC in database
- Cron expression evaluated in configured timezone
- 9:00 AM Pakistan time = 4:00 AM UTC

## 📝 Example Use Cases

### Case 1: Fixed Work Hours (9 AM - 5 PM)
```env
CHECK_IN_TIME="09:00"
CHECK_OUT_TIME="17:00"
CRON_TIMEZONE="Asia/Karachi"
```
✅ Perfect for standard office jobs

### Case 2: Shift-based (8 AM - 4 PM)
```env
CHECK_IN_TIME="08:00"
CHECK_OUT_TIME="16:00"
CRON_TIMEZONE="Asia/Karachi"
```

### Case 3: Disable Cron (Manual Device Only)
```env
ENABLE_CRON=false
```
Cron jobs won't run; only device-based attendance processed.

## ⚙️ Troubleshooting

### Cron Jobs Not Running
**Problem:** Logs show "❌ Cron jobs are disabled"
```
Solution: Set ENABLE_CRON=true in .env
```

### Wrong Time Triggering
**Problem:** Check-in happens at wrong time
```
Solution: Verify CRON_TIMEZONE matches your region
Current: Asia/Karachi (UTC+5)
```

### No Employees Found
**Problem:** Logs show "[CRON] No employees found"
```
Solution: Create employee users first
Run: npm run seed:admin (creates admin user)
Then create employees via: POST /api/v1/users/register
```

### Errors in Logs
**Problem:** "Check-in failed for user..."
```
Solution: 
1. Check database connection
2. Verify AttendanceDaily records exist
3. Check user has valid role="EMPLOYEE"
```

## 📱 Combining with Device Integration

You can use cron jobs **alongside** device integration:

```
Device Integration (Real-time)
         +
Cron Jobs (Automatic Fallback)
         =
Comprehensive Coverage
```

**Best Practice:**
- Use ADMS protocol or polling for real-time data
- Use cron jobs as backup for absent records
- Set different times to avoid conflicts

## 🔄 Disabling Cron Temporarily

### Option 1: Environment Variable
```env
ENABLE_CRON=false
```

### Option 2: Skip for Specific Day
Modify `scheduleCheckIn()` to add holiday logic:
```typescript
// Add this to check holidays
const holidays = ['2026-04-14', '2026-08-14']; // Eid, Independence Day
if (holidays.includes(dateStr)) return;
```

## 📊 Monitoring Cron Jobs

### Check Logs
```bash
# Real-time logs (development)
npm run dev

# Grep for cron entries
grep -i "cron" logs/app.log
```

### Database Query
```sql
-- Get all automatic records
SELECT * FROM AttendanceLog 
WHERE rawPayload->'$.source' = 'AUTOMATIC_CRON'
ORDER BY timestamp DESC;
```

## 🚀 Production Deployment

### Recommended Configuration
```env
ENABLE_CRON=true
CHECK_IN_TIME="09:00"
CHECK_OUT_TIME="17:00"
CRON_TIMEZONE="Asia/Karachi"
NODE_ENV=production
```

### Monitoring Setup
1. Set up log rotation
2. Add error notifications
3. Monitor job execution times
4. Set up alerts for failed jobs

## 📞 Support

### Common Questions

**Q: Can I have different check-in times for different employees?**
A: Currently, all employees use same times. To customize, modify [src/services/cron.service.ts](src/services/cron.service.ts) to read per-employee settings from database.

**Q: Will cron jobs overwrite manual device attendance?**
A: No, cron jobs only process if no attendance record exists. Device data takes priority.

**Q: How accurate is the timestamp?**
A: Timestamps are recorded when cron job executes (might be ±1 second due to system load).

**Q: Can I run multiple server instances?**
A: Yes, each instance will run cron jobs. Consider disabling on some instances if you need to avoid duplicates.

---

**Last Updated:** April 2026  
**Version:** 1.0.0
