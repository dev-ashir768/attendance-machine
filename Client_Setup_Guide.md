# Cloud Attendance Management - Client System Guide

Welcome to the Cloud Attendance Management system! This modern infrastructure flawlessly connects your offline ZKTeco biometric devices to a centralized cloud application, giving you intelligent automated daily reports and employee monitoring.

## System Architecture: How It Works

The architecture works in two synchronous parts:

1. **The Pulse (Machine ADMS)**: Your ZKTeco K60 acts as a push-transmitter. Whenever an employee scans their fingerprint, the machine instantly dials the backend cloud and pushes a tiny text snippet indicating their ID and timestamp.
2. **The Brain (Cloud Backend)**: The server receives this signal, applies "debouncing" checks (ensures someone didn't scan 5 times in a panic), and pairs Check-Ins and Check-Outs dynamically to calculate session durations.

---

## Part 1: Physical Machine Setup (ZKTeco K60)

The ZKTeco offline machines must be instructed to push their data over the internet directly to your servers.

### Configuration Steps

On your ZKTeco K60 keypad, follow these steps to securely link it:

1. Press **`M/OK`** to access the Main Menu.
2. Navigate to **`Comm.` (Communication)**.
3. Access **`Cloud Server Setting` / `ADMS`**.
4. Set the **Server Address**: Enter your public domain (e.g., `api.yourcompany.com`) or Static IP address.
5. Set the **Server Port**: Usually `80` (or whichever port handles public HTTP routing).
6. Enable **Domain Name**: _(Turn ON only if using a domain string instead of numbers)_.

_Note: Once connected, the machine's "Cloud" status icon mapping should indicate a successful handshake, and the ADMS push stream activates instantly._

---

## Part 2: Admin Dashboard Capabilities

Your backend provides a robust frontend system where Administrators can observe and manage data.

**What you can do via the Dashboard:**

- **Match Employees to Machine IDs:**
  When you register a user on the physical ZKTeco machine, it provides a simple number (e.g., `ID: 15`). Through the API, you can register `John Doe` into the cloud database and input `deviceUserId=15`. The server automatically pairs `John Doe's` beautiful profile picture and Email to those raw `15` punches!
- **Auto-Calculated Working Sessions:**
  The API isolates raw log noise. Using the `/api/v1/attendance/history` route, you retrieve an organized timeline. Instead of "Punch In, Punch Out" confusion, employees get paired daily sessions showing `[Date] -> [Check In Time] -> [Check Out Time] -> [Duration in Minutes]`.

- **Custom Date Filters:**
  You can effortlessly filter your organizational view to isolate exact dates (e.g., `startDate=2026-04-01&endDate=2026-04-30`) to calculate monthly payrolls or isolate a single user UUID.

---

## Frequently Asked Questions

**What if the internet goes down?**

- The ZKTeco machine has a built-in memory buffer. If the Wi-Fi drops, it successfully logs the fingerprints internally. The moment internet is restored, it rapidly "flushes" all stored logs over the ADMS tunnel to your backend, ensuring absolutely no lost data!

**What if an employee clicks multiple times repeatedly?**

- The servers possess an algorithmic duplicate trap! Scans occurring within 5 minutes of an original are intelligently discarded to protect data cleanliness.

**Are the endpoints secure?**

- Admin dashboard endpoints rely on encrypted JSON Web Tokens (JWT) meaning nobody can pull salary logs without a cryptographic signature. ADMS logs utilize proprietary ZKTeco Push encryptions protecting machine traffic.
