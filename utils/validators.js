import { z } from 'zod';

export const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
};

export const registerSchema = z.object({
  phone: z.string().length(11, 'ফোন নাম্বার অবশ্যই ১১ ডিজিটের হতে হবে').regex(/^\d+$/, 'শুধুমাত্র সংখ্যা গ্রহণযোগ্য'),
  password: z.string().min(3, 'পাসওয়ার্ড অন্তত ৩ অক্ষরের হতে হবে'),
});

export const loginSchema = z.object({
  phone: z.string().length(11),
  password: z.string().min(1),
});

export const betSchema = z.object({
  choice: z.enum(['BIG', 'SMALL']),
  amount: z.number().positive('পরিমাণ অবশ্যই পজিটিভ হতে হবে').min(1),
  roundNo: z.number().int().positive(),
});