import { Request, Response } from 'express';
import { AttendanceService } from '../attendance/attendance.service';

const attendanceService = new AttendanceService();

export const handshake = (req: Request, res: Response) => {
  // Acknowledge the device
  res.send('OK\n');
};

export const getRequest = (req: Request, res: Response) => {
  // Acknowledge no pending commands.
  res.send('OK\n');
};

export const receiveData = async (req: Request, res: Response) => {
  try {
    const { SN, table } = req.query as { SN: string; table: string };
    const deviceId = SN || 'K60_DEVICE';
    
    // ZKTeco defines the type of push in the 'table' parameter
    if (table === 'ATTLOG' || !table) {
      const rawBody = req.body; 
      
      // ADMS sends text, so express text middleware must intercept this.
      if (typeof rawBody !== 'string') {
        return res.send('OK\n');
      }

      const lines = rawBody.split('\n').filter((l) => l.trim() !== '');

      for (const line of lines) {
        // ADMS string template: USER_ID\tSTART_TIME\tPUNCH_STATE\tVERIFY_MODE
        // Example: 12345	2026-04-04 09:00:00	0	1
        const parts = line.split('\t');
        if (parts.length >= 2) {
          const deviceUserId = parts[0];
          // Replace space with T to make it ISO parseable
          const timestampStr = parts[1].replace(' ', 'T');
          
          let punchType = '0';
          if (parts.length >= 3) {
             punchType = parts[2]; // 0 = In, 1 = Out, etc.
          }

          try {
            if (punchType === '1' || punchType === '5') {
               await attendanceService.processCheckOut(deviceUserId, deviceId, timestampStr, { raw: line });
            } else {
               // Default to check-in for 0 (In), 4 (OT In), or unknown
               await attendanceService.processCheckIn(deviceUserId, deviceId, timestampStr, { raw: line });
            }
          } catch (e: any) {
            console.error(`Error processing ADMS log for user ${deviceUserId}:`, e.message);
          }
        }
      }
    }
    
    // Server must respond with OK exactly over plaintext
    res.send('OK\n');
  } catch (err) {
    console.error('ADMS Parsing Error:', err);
    res.send('ERROR\n');
  }
};
