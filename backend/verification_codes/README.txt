VERIFICATION CODES DIRECTORY
============================

This directory stores verification codes for development/testing purposes.

Files:
- phone_codes.txt: Phone verification codes
- email_codes.txt: Email verification codes
- 2fa_sms_codes.txt: 2FA SMS codes
- 2fa_email_codes.txt: 2FA email codes

Format:
YYYY-MM-DD HH:MM:SS | User: <user_id> | Phone: <phone_number> | Code: <6-digit-code>

Example:
2025-01-15 10:30:45 | User: 123e4567-e89b-12d3-a456-426614174000 | Phone: +254712345678 | Code: 123456

Usage:
1. User registers or requests verification
2. Code is generated and saved to this directory
3. Check the appropriate file for the verification code
4. Use the code in the frontend to verify

Note: In production, codes will be sent via SMS/Email instead of being saved to files.
