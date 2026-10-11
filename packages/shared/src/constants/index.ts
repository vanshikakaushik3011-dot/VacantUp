export const BRAND = {
  NAME: 'VacantUp',
  TAGLINE: 'Skip the Queue. Find Available Doctors Instantly.',
  HERO_HEADING: 'Healthcare Appointments, Without the Wait.',
  HERO_DESCRIPTION:
    'Discover doctors, check appointment availability, and book your visit online in just a few clicks.',
  PRIMARY_COLOR: '#0284C7', // Medical Blue
  ACCENT_COLOR: '#0D9488', // Teal
};

export const SUPPORTED_CITIES = [
  'Karnal',
  'New Delhi',
  'Gurugram',
  'Chandigarh',
  'Bengaluru',
  'Mumbai',
  'Jaipur',
  'Hyderabad',
  'Pune',
  'Noida',
] as const;

export const POPULAR_SPECIALTIES = [
  { name: 'Dermatology', slug: 'dermatology', icon: 'Sparkles', desc: 'Skin, hair, and nail conditions' },
  { name: 'Cardiology', slug: 'cardiology', icon: 'HeartPulse', desc: 'Heart care and vascular health' },
  { name: 'Pediatrics', slug: 'pediatrics', icon: 'Baby', desc: 'Child and adolescent healthcare' },
  { name: 'Orthopedics', slug: 'orthopedics', icon: 'Bone', desc: 'Bones, joints, and spine treatment' },
  { name: 'Neurology', slug: 'neurology', icon: 'Brain', desc: 'Brain and nervous system disorders' },
  { name: 'General Medicine', slug: 'general-medicine', icon: 'Stethoscope', desc: 'Everyday ailments and preventive care' },
  { name: 'Gynecology', slug: 'gynecology', icon: 'Activity', desc: "Women's reproductive health" },
  { name: 'ENT', slug: 'ent', icon: 'Ear', desc: 'Ear, nose, and throat treatments' },
  { name: 'Ophthalmology', slug: 'ophthalmology', icon: 'Eye', desc: 'Vision and eye surgeries' },
  { name: 'Dentistry', slug: 'dentistry', icon: 'Smile', desc: 'Dental and oral hygiene' },
] as const;

export const AVAILABILITY_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'Available', color: '#16A34A', bg: '#DCFCE7' },
  FEW_SLOTS_LEFT: { label: 'Few Slots Left', color: '#D97706', bg: '#FEF3C7' },
  FULLY_BOOKED: { label: 'Fully Booked', color: '#DC2626', bg: '#FEE2E2' },
  ON_LEAVE: { label: 'On Leave', color: '#6B7280', bg: '#F3F4F6' },
  NOT_AVAILABLE: { label: 'Not Available', color: '#6B7280', bg: '#F3F4F6' },
  SCHEDULE_NOT_AVAILABLE: { label: 'Schedule Not Available', color: '#9CA3AF', bg: '#F9FAFB' },
};

export const DEFAULT_SLOT_DURATION_MINUTES = 20;
