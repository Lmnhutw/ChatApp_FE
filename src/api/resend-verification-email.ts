// pages/api/auth/resend-verification-email.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { authService, getApiErrorMessage, toApiError } from '@/services';

const resendVerificationEmail = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const email = typeof req.body?.email === 'string' ? req.body.email : undefined;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const response = await authService.resendVerificationEmail(email);
    return res.status(200).json(response);
  } catch (error: unknown) {
    const apiError = toApiError(error);
    return res.status(apiError.status ?? 500).json({
      message: getApiErrorMessage(error, 'An unknown error occurred'),
    });
  }
};

export default resendVerificationEmail;
