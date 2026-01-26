-- ========================================
-- Populate Real Data for Guide Web Portal
-- ========================================

-- 1. Create sample travelers (users)
INSERT INTO users (id, email, first_name, last_name, phone, role, status, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'john.doe@example.com', 'John', 'Doe', '+8801712345678', 'traveler', 'active', NOW() - INTERVAL '10 days'),
  ('22222222-2222-2222-2222-222222222222', 'sarah.smith@example.com', 'Sarah', 'Smith', '+8801798765432', 'traveler', 'active', NOW() - INTERVAL '8 days'),
  ('33333333-3333-3333-3333-333333333333', 'michael.johnson@example.com', 'Michael', 'Johnson', '+8801656789012', 'traveler', 'active', NOW() - INTERVAL '5 days'),
  ('44444444-4444-4444-4444-444444444444', 'emma.williams@example.com', 'Emma', 'Williams', '+8801523456789', 'traveler', 'active', NOW() - INTERVAL '3 days'),
  ('55555555-5555-5555-5555-555555555555', 'david.brown@example.com', 'David', 'Brown', '+8801887654321', 'traveler', 'active', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone;

-- 2. Get the first guide from the database (we'll use this guide)
DO $$
DECLARE
  guide_user_id UUID;
  guide_id UUID;
BEGIN
  -- Get first guide user
  SELECT users.id, guides.id INTO guide_user_id, guide_id
  FROM users
  JOIN guides ON users.id = guides.user_id
  WHERE users.role = 'guide'
  AND guides.verification_status = 'approved'
  LIMIT 1;

  IF guide_user_id IS NULL THEN
    RAISE NOTICE 'No approved guide found. Please create a guide first.';
    RETURN;
  END IF;

  RAISE NOTICE 'Using guide_user_id: %, guide_id: %', guide_user_id, guide_id;

  -- 3. Create Chat Rooms between guide and travelers
  INSERT INTO chat_rooms (id, user1_id, user2_id, last_message, last_message_at, created_at)
  VALUES 
    ('c0000000-0000-0000-0000-000000000001', guide_user_id, '11111111-1111-1111-1111-111111111111', 
     'Yes, I can help you plan the perfect tour of Dhaka!', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '10 days'),
    ('c0000000-0000-0000-0000-000000000002', guide_user_id, '22222222-2222-2222-2222-222222222222', 
     'The weather should be perfect for visiting Cox''s Bazar next week.', NOW() - INTERVAL '1 day', NOW() - INTERVAL '8 days'),
    ('c0000000-0000-0000-0000-000000000003', guide_user_id, '33333333-3333-3333-3333-333333333333', 
     'I''ll pick you up from the hotel at 9 AM tomorrow.', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '5 days'),
    ('c0000000-0000-0000-0000-000000000004', guide_user_id, '44444444-4444-4444-4444-444444444444', 
     'Sure! I can arrange transportation to Sylhet.', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '3 days'),
    ('c0000000-0000-0000-0000-000000000005', guide_user_id, '55555555-5555-5555-5555-555555555555', 
     'Looking forward to showing you around Sundarbans!', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '1 day')
  ON CONFLICT (id) DO UPDATE SET
    last_message = EXCLUDED.last_message,
    last_message_at = EXCLUDED.last_message_at;

  -- 4. Create Chat Messages
  INSERT INTO chat_messages (id, room_id, sender_id, message, created_at, is_read)
  VALUES 
    -- Room 1 (John Doe)
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 
     'Hi! I''m planning to visit Dhaka next month. Can you help me?', NOW() - INTERVAL '10 days', true),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', guide_user_id, 
     'Hello John! I''d be happy to help. What are you interested in seeing?', NOW() - INTERVAL '10 days' + INTERVAL '10 minutes', true),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 
     'I want to see historical sites, local markets, and try authentic food.', NOW() - INTERVAL '10 days' + INTERVAL '30 minutes', true),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000001', guide_user_id, 
     'Yes, I can help you plan the perfect tour of Dhaka!', NOW() - INTERVAL '2 hours', true),
    
    -- Room 2 (Sarah Smith)
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 
     'Hello! I heard you''re an expert guide for Cox''s Bazar?', NOW() - INTERVAL '8 days', true),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', guide_user_id, 
     'Yes! I''ve been guiding there for 5 years. When are you planning to visit?', NOW() - INTERVAL '8 days' + INTERVAL '20 minutes', true),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 
     'Next week! What''s the weather like?', NOW() - INTERVAL '1 day' + INTERVAL '5 minutes', true),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000002', guide_user_id, 
     'The weather should be perfect for visiting Cox''s Bazar next week.', NOW() - INTERVAL '1 day', false),
    
    -- Room 3 (Michael Johnson)
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 
     'Are you available for a city tour tomorrow?', NOW() - INTERVAL '5 days', true),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', guide_user_id, 
     'Yes, I am! What time works for you?', NOW() - INTERVAL '5 days' + INTERVAL '5 minutes', true),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 
     'Around 9 AM from my hotel?', NOW() - INTERVAL '35 minutes', true),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000003', guide_user_id, 
     'I''ll pick you up from the hotel at 9 AM tomorrow.', NOW() - INTERVAL '30 minutes', false),
    
    -- Room 4 (Emma Williams)
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', 
     'Do you provide transportation services to Sylhet?', NOW() - INTERVAL '3 days', true),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000004', guide_user_id, 
     'Sure! I can arrange transportation to Sylhet.', NOW() - INTERVAL '5 hours', false),
    
    -- Room 5 (David Brown)  
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', 
     'I want to book a tour to Sundarbans. Are you available?', NOW() - INTERVAL '1 day', true),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', guide_user_id, 
     'Yes! The Sundarbans is amazing. When would you like to go?', NOW() - INTERVAL '20 hours', true),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', 
     'This weekend if possible?', NOW() - INTERVAL '20 minutes', true),
    (gen_random_uuid(), 'c0000000-0000-0000-0000-000000000005', guide_user_id, 
     'Looking forward to showing you around Sundarbans!', NOW() - INTERVAL '15 minutes', false)
  ON CONFLICT DO NOTHING;

  -- 5. Create Transport Bookings
  INSERT INTO transport_bookings (id, user_id, guide_id, transport_type, from_location, to_location, 
                                   booking_date, pickup_time, passengers, total_amount, status, 
                                   payment_method, traveler_name, phone, email, created_at)
  VALUES 
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', guide_id, 'Car', 'Dhaka Airport', 'Hotel Radisson',
     (CURRENT_DATE + INTERVAL '2 days')::date, '14:00', 2, 1500, 'confirmed', 'card',
     'John Doe', '+8801712345678', 'john.doe@example.com', NOW() - INTERVAL '3 days'),
     
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', guide_id, 'SUV', 'Dhaka', 'Cox''s Bazar',
     (CURRENT_DATE + INTERVAL '7 days')::date, '06:00', 4, 8500, 'confirmed', 'bkash',
     'Sarah Smith', '+8801798765432', 'sarah.smith@example.com', NOW() - INTERVAL '2 days'),
     
    (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', guide_id, 'Car', 'Hotel InterContinental', 'Old Dhaka',
     (CURRENT_DATE + INTERVAL '1 day')::date, '09:00', 3, 2000, 'pending', 'cash',
     'Michael Johnson', '+8801656789012', 'michael.johnson@example.com', NOW() - INTERVAL '5 hours'),
     
    (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', guide_id, 'Van', 'Dhaka', 'Sylhet',
     (CURRENT_DATE + INTERVAL '5 days')::date, '07:00', 6, 12000, 'confirmed', 'nagad',
     'Emma Williams', '+8801523456789', 'emma.williams@example.com', NOW() - INTERVAL '1 day'),
     
    (gen_random_uuid(), '55555555-5555-5555-5555-555555555555', guide_id, 'SUV', 'Dhaka', 'Sundarbans',
     (CURRENT_DATE + INTERVAL '3 days')::date, '05:30', 5, 15000, 'pending', 'card',
     'David Brown', '+8801887654321', 'david.brown@example.com', NOW() - INTERVAL '30 minutes'),
     
    (gen_random_uuid(), '11111111-1111-1111-1111-111111111111', guide_id, 'Car', 'Hotel', 'Lalbagh Fort',
     (CURRENT_DATE - INTERVAL '5 days')::date, '10:00', 2, 1200, 'completed', 'bkash',
     'John Doe', '+8801712345678', 'john.doe@example.com', NOW() - INTERVAL '6 days'),
     
    (gen_random_uuid(), '22222222-2222-2222-2222-222222222222', guide_id, 'Car', 'Dhaka', 'Sonargaon',
     (CURRENT_DATE - INTERVAL '3 days')::date, '08:00', 3, 3500, 'completed', 'cash',
     'Sarah Smith', '+8801798765432', 'sarah.smith@example.com', NOW() - INTERVAL '4 days')
  ON CONFLICT DO NOTHING;

  -- 6. Create Guide Reviews
  INSERT INTO reviews (id, guide_id, user_id, booking_id, rating, comment, created_at)
  SELECT 
    gen_random_uuid(),
    guide_id,
    '11111111-1111-1111-1111-111111111111',
    tb.id,
    5,
    'Excellent guide! Very knowledgeable about Dhaka history and showed me amazing places.',
    NOW() - INTERVAL '5 days'
  FROM transport_bookings tb
  WHERE tb.traveler_name = 'John Doe' 
  AND tb.status = 'completed'
  LIMIT 1
  ON CONFLICT DO NOTHING;

  INSERT INTO reviews (id, guide_id, user_id, rating, comment, created_at)
  VALUES
    (gen_random_uuid(), guide_id, '22222222-2222-2222-2222-222222222222', 5,
     'Best tour guide ever! Made my Cox''s Bazar trip unforgettable.', NOW() - INTERVAL '3 days'),
    (gen_random_uuid(), guide_id, '33333333-3333-3333-3333-333333333333', 4,
     'Very professional and punctual. Highly recommend!', NOW() - INTERVAL '2 days')
  ON CONFLICT DO NOTHING;

END $$;

-- 7. Update guide statistics
UPDATE guides g
SET 
  total_bookings = (
    SELECT COUNT(*) 
    FROM transport_bookings tb 
    WHERE tb.guide_id = g.id
  ),
  total_earnings = (
    SELECT COALESCE(SUM(total_amount), 0)
    FROM transport_bookings tb 
    WHERE tb.guide_id = g.id 
    AND tb.status = 'completed'
  ),
  average_rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM reviews r 
    WHERE r.guide_id = g.id
  )
WHERE EXISTS (
  SELECT 1 FROM users u 
  WHERE u.id = g.user_id 
  AND u.role = 'guide'
);
