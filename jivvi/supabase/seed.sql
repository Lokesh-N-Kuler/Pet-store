-- ==============================================================================
-- JIVVI E-COMMERCE SEED DATA
-- Description: Production-ready demo catalog, categories, inventory, and coupons.
-- ==============================================================================

-- 1. SEED CATEGORIES
INSERT INTO public.categories (id, name, slug, description, image_url, pet_type, is_active)
VALUES
  ('c1000000-0000-0000-0000-000000000001', 'Food & Treats', 'food-treats', 'Wholesome organic kibble, grain-free wet recipes, and training treats', '/images/care.jpg', 'both', true),
  ('c1000000-0000-0000-0000-000000000002', 'Toys & Play', 'toys', 'Durable chew toys, interactive feather teasers, and puzzle dispensers', '/images/section.jpg', 'both', true),
  ('c1000000-0000-0000-0000-000000000003', 'Grooming & Bath', 'grooming', 'Gentle organic shampoos, self-cleaning brushes, and coat sprays', '/images/dogs.jpg', 'both', true),
  ('c1000000-0000-0000-0000-000000000004', 'Beds & Comfort', 'beds-comfort', 'Orthopedic memory foam loungers and wool cat caves', '/images/cats.jpg', 'both', true),
  ('c1000000-0000-0000-0000-000000000005', 'Health & Wellness', 'health-wellness', 'Krill oil joint drops, calming treats, and dental care', '/images/hero.jpg', 'both', true),
  ('c1000000-0000-0000-0000-000000000006', 'Accessories & Bowls', 'accessories', 'No-pull breathable harnesses, ceramic bowls, and leashes', '/images/care.jpg', 'both', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 2. SEED BRANDS
INSERT INTO public.brands (id, name, slug, description, is_active)
VALUES
  ('b1000000-0000-0000-0000-000000000001', 'JIVVI Curated', 'jivvi-curated', 'Proprietary wellness and care essentials', true),
  ('b1000000-0000-0000-0000-000000000002', 'WildCoast Pet', 'wildcoast-pet', 'Natural seafood and raw-blend nutrition', true),
  ('b1000000-0000-0000-0000-000000000003', 'ToughPaws', 'toughpaws', 'Ultra-durable chew and outdoor adventure gear', true),
  ('b1000000-0000-0000-0000-000000000004', 'PureCoat Botanicals', 'purecoat', 'Hypoallergenic spa and grooming routines', true)
ON CONFLICT (slug) DO NOTHING;

-- 3. SEED PRODUCTS
INSERT INTO public.products (
  id, category_id, brand_id, name, slug, description, sku, cost_price, price, sale_price, stock_quantity, low_stock_threshold, weight, is_featured, is_active
) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000002',
    'Wild Alaskan Salmon & Brown Rice Dry Kibble',
    'wild-alaskan-salmon-kibble',
    'Rich in Omega-3 for shiny coats and healthy joints. 100% grain-balanced with real Alaskan salmon, sweet potatoes, and organic blueberries.',
    'JIV-DOG-FOOD-001',
    950.00,
    1899.00,
    1499.00,
    45,
    10,
    '2.5 kg',
    true,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'Tuna & Free-Range Chicken Squeeze Puree Treats',
    'tuna-chicken-puree-treats',
    'Lickable creamy puree packed with taurine and vitamin E. Box of 12 tubes. Irresistible hydration treat for finicky cats.',
    'JIV-CAT-TRT-002',
    280.00,
    650.00,
    499.00,
    80,
    15,
    '12 x 15g',
    true,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000003',
    'ToughFlex Natural Dental Chew Bone',
    'toughflex-dental-chew-bone',
    'Indestructible non-toxic natural rubber with dental cleaning nubs and peanut-butter fill chamber for power chewers.',
    'JIV-DOG-TOY-003',
    290.00,
    799.00,
    599.00,
    65,
    10,
    'Medium / Large',
    true,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000001',
    'Retractable Carbon Feather Teaser Wand',
    'retractable-feather-wand',
    'Flexible bell-tipped carbon rod with 3 interchangeable natural feather lures. Reawakens feline hunting instincts safely indoors.',
    'JIV-CAT-TOY-004',
    210.00,
    599.00,
    449.00,
    50,
    10,
    'Extendable 90cm',
    true,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'c1000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000004',
    'Organic Oatmeal & Lavender Soothing Pet Shampoo',
    'oatmeal-lavender-shampoo',
    'Hypoallergenic, tearless botanical formula that relieves dry, itchy skin and conditions sensitive coats with French lavender essence.',
    'JIV-PET-GRM-005',
    340.00,
    850.00,
    649.00,
    40,
    8,
    '400 ml',
    true,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    'c1000000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000001',
    'SmartRelease Self-Cleaning Slicker Brush',
    'smartrelease-slicker-brush',
    'One-button fur ejector with protected round-tip bristles for painless de-shedding. Reduces shedding around the home by up to 90%.',
    'JIV-PET-BRS-006',
    260.00,
    699.00,
    549.00,
    35,
    8,
    'Universal',
    true,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    'c1000000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000001',
    'CloudRest Orthopedic Memory Foam Lounge Bed',
    'cloudrest-orthopedic-bed',
    'Dual-density high-resilience memory foam base with water-repellent, machine-washable velvet cover. Ideal for adult & senior dogs.',
    'JIV-DOG-BED-007',
    1350.00,
    3299.00,
    2499.00,
    15,
    5,
    'Large (85 x 65cm)',
    true,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    'c1000000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000001',
    'Felted Merino Wool Modern Cat Igloo Pod',
    'merino-wool-cat-igloo',
    '100% natural insulated wool cave providing dark, warm, sound-dampening security for restful naps. Fits cats up to 8kg.',
    'JIV-CAT-BED-008',
    1050.00,
    2299.00,
    1899.00,
    20,
    5,
    'Up to 8kg cats',
    true,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000009',
    'c1000000-0000-0000-0000-000000000005',
    'b1000000-0000-0000-0000-000000000002',
    'Pure Wild Antarctic Krill Oil Hip & Joint Drops',
    'antarctic-krill-oil-drops',
    'Pure EPA/DHA phospholipid liquid booster for rapid joint mobility support, cardiac vitality, and lustrous coat conditioning.',
    'JIV-PET-SUP-009',
    480.00,
    1199.00,
    899.00,
    30,
    8,
    '200 ml',
    true,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000010',
    'c1000000-0000-0000-0000-000000000005',
    'b1000000-0000-0000-0000-000000000001',
    'Chamomile & L-Theanine Calming Soft Chews',
    'chamomile-calming-chews',
    'Fast-acting herbal support for fireworks, thunderstorms, separation distress, grooming stress, and car travel.',
    'JIV-DOG-CLM-010',
    420.00,
    999.00,
    799.00,
    25,
    8,
    '60 Soft Chews',
    true,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000011',
    'c1000000-0000-0000-0000-000000000006',
    'b1000000-0000-0000-0000-000000000003',
    'AeroFit All-Day No-Pull Padded Dog Harness',
    'aerofit-no-pull-harness',
    'Ergonomic breathable air-mesh with dual zinc lead rings, quick-control traffic handle, and 3M Scotchlite reflective piping.',
    'JIV-DOG-ACC-011',
    620.00,
    1599.00,
    1199.00,
    28,
    6,
    'Adjustable M / L',
    true,
    true
  ),
  (
    '10000000-0000-0000-0000-000000000012',
    'c1000000-0000-0000-0000-000000000006',
    'b1000000-0000-0000-0000-000000000001',
    'Artisan Ceramic Anti-Gulping Whisker-Friendly Bowl',
    'ceramic-anti-gulping-bowl',
    'Heavyweight chip-resistant ceramic with slow-eating maze ridges. Prevents choking, bloat, and whisker fatigue.',
    'JIV-PET-BWL-012',
    360.00,
    899.00,
    699.00,
    22,
    5,
    'Medium 850ml',
    true,
    true
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  sale_price = EXCLUDED.sale_price,
  stock_quantity = EXCLUDED.stock_quantity;

-- Ensure inventory rows match products
INSERT INTO public.inventory (product_id, quantity, reserved_quantity)
SELECT id, stock_quantity, 0
FROM public.products
ON CONFLICT (product_id) DO UPDATE SET
  quantity = EXCLUDED.quantity;

-- 4. SEED COUPONS
INSERT INTO public.coupons (
  id, code, description, discount_type, discount_value, minimum_order_amount, maximum_discount, usage_limit, used_count, valid_from, valid_until, is_active
) VALUES
  (
    'd1000000-0000-0000-0000-000000000001',
    'WELCOME10',
    '10% discount on your first JIVVI pet care order',
    'percentage',
    10.00,
    499.00,
    250.00,
    1000,
    0,
    now() - INTERVAL '1 day',
    now() + INTERVAL '365 days',
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000002',
    'BENGALURUFREE',
    'Free delivery credit (₹79 discount) for Bengaluru pet parents',
    'fixed',
    79.00,
    299.00,
    79.00,
    5000,
    0,
    now() - INTERVAL '1 day',
    now() + INTERVAL '365 days',
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000003',
    'JIVVIPUPPY',
    '15% off premium nutrition and toys for new companions',
    'percentage',
    15.00,
    999.00,
    450.00,
    500,
    0,
    now() - INTERVAL '1 day',
    now() + INTERVAL '365 days',
    true
  )
ON CONFLICT (code) DO NOTHING;

-- 5. SEED SUPPLIERS
INSERT INTO public.suppliers (
  id, business_name, contact_name, phone, email, address, city, state, pincode, gst_number, notes, is_active
) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'Karnataka Pet Wholesale Distributors Pvt Ltd',
    'Ramesh Narayana',
    '+91 98860 11223',
    'orders@karnatakapets.com',
    'Plot 42, Peenya Industrial Area 2nd Stage',
    'Bengaluru',
    'Karnataka',
    '560058',
    '29AAACK1234F1Z8',
    'Primary regional distributor for dry kibble, wet food cans, and purees.',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'EcoPaws Living & Grooming Supplies',
    'Deepa Sundaram',
    '+91 99450 44556',
    'sales@ecopawsliving.in',
    '18, BTM Layout 2nd Stage, Outer Ring Road',
    'Bengaluru',
    'Karnataka',
    '560076',
    '29BBCDE5678G2Z4',
    'Direct manufacturer of orthopedic pet beds, wool caves, and botanical shampoos.',
    true
  )
ON CONFLICT DO NOTHING;

-- 6. SEED DELIVERY CONFIG
INSERT INTO public.delivery_config (id, city, delivery_fee, free_delivery_threshold, is_active)
VALUES (
  'e1000000-0000-0000-0000-000000000001',
  'Bengaluru',
  79.00,
  999.00,
  true
) ON CONFLICT DO NOTHING;
