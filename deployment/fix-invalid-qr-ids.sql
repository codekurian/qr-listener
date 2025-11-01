-- Fix invalid QR IDs to match validation pattern: ^[A-Z]{2,10}-[A-Z0-9]{8}$
-- This fixes QR IDs that don't match the required format

-- Fix MARKET-12345678 (has numbers, should be uppercase alphanumeric)
UPDATE qr_codes 
SET qr_id = 'MARKET-A1B2C3D4' 
WHERE qr_id = 'MARKET-12345678';

-- Fix event-60EC5D8C (lowercase prefix, should be uppercase)
UPDATE qr_codes 
SET qr_id = 'EVENT-60EC5D8C' 
WHERE qr_id = 'event-60EC5D8C';

-- Verify all QR IDs now match the pattern
SELECT qr_id, 
       CASE 
         WHEN qr_id ~ '^[A-Z]{2,10}-[A-Z0-9]{8}$' THEN 'VALID'
         ELSE 'INVALID'
       END as status
FROM qr_codes;

