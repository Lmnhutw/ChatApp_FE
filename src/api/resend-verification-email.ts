// pages/api/auth/resend-verification-email.ts

import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const resendVerificationEmail = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  try {
    const response = await axios.post('https://localhost:5000/api/Auth/resend-verification-email', { email });
    return res.status(response.status).json(response.data);
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      return res.status(error.response.status).json({ message: error.response.data.message });
    } else {
      return res.status(500).json({ message: 'An unknown error occurred' });
    }
  }
};

export default resendVerificationEmail;
