import { Router } from 'express';
import { handshake, receiveData, getRequest } from '../modules/iclock/iclock.controller';

const router = Router();

// The K60 machine hits this to verify the server is alive
router.get('/cdata', handshake);

// The K60 machine pushes raw attendance logs here
router.post('/cdata', receiveData);

// The K60 machine polls for commands 
router.get('/getrequest', getRequest);

export default router;
