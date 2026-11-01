import { EXTENSIVE_MEDICINES_DATABASE } from './medicinesDataset';

export interface HospitalDepartment {
  id: string;
  name: string;
  currentServing: number;
  totalWaiting: number;
  avgTimePerPatient: number; // minutes
}

export interface Hospital {
  id: string;
  name: string;
  location: string;
  distance: string;
  city: string;
  departments: HospitalDepartment[];
}

export interface QueueToken {
  id: string;
  tokenNumber: string;
  hospitalName: string;
  departmentName: string;
  patientName: string;
  patientPhone: string;
  queuePosition: number;
  currentServing: number;
  estimatedWaitMinutes: number;
  status: 'Waiting' | 'Serving Now' | 'In Consultation' | 'Completed' | 'Cancelled' | 'Absent';
  bookedAt: string;
  doctorName?: string;
  roomNumber?: string;
  patientAge?: number;
  patientGender?: 'Male' | 'Female' | 'Other';
  problem?: string;
}

export interface MedicineItem {
  id: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  category: string;
  activeIngredients: string[];
  uses: string[];
  howToTake: string;
  commonUses: string;
  precautions: string[];
  warnings: string[];
  storage: string;
  price: string;
  confidenceScore: number;
  similarSoundingMeds: string[];
  verificationDate: string;
  image?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  distanceKm: number;
  timing: string;
  stockStatus: 'In Stock' | 'Limited Stock' | 'Out of Stock';
  availableMedicines: string[];
  isOpen24x7: boolean;
  lat: number;
  lng: number;
  landmark?: string;
  pincode: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  rating: number;
  hospital: string;
  availableSlot: string;
  consultationFee: string;
  languages: string[];
}

export interface MedicalReport {
  id: string;
  patientName: string;
  reportDate: string;
  testType: string;
  summary: string;
  mainPoints: string[];
  overallStatus: 'Normal' | 'Needs Attention' | 'Critical';
  vitalsAndValues: {
    test: string;
    value: string;
    unit: string;
    referenceRange: string;
    flag: 'Normal' | 'High' | 'Low';
    simpleExplanation: string;
  }[];
  questionsForDoctor: string[];
  lifestyleAdvice: string[];
}

export interface MedicineReminder {
  id: string;
  medicineName: string;
  dosage: string;
  time: string;
  frequency: string;
  mealTiming: 'Before Meal' | 'After Meal';
  startDate: string;
  endDate: string;
  durationDays: number;
  specificTimes: string[];
  alarmSoundEnabled: boolean;
  notificationEnabled: boolean;
  active: boolean;
  taken?: boolean;
}

// Initial Mock Data
export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: "King George's Medical University (KGMU)",
    location: 'Shah Mina Road, Chowk, Lucknow',
    distance: '6.2 km from BIET',
    city: 'Lucknow (226003)',
    departments: [
      { id: 'dep-1', name: 'General Medicine / OPD Room 104', currentServing: 20, totalWaiting: 14, avgTimePerPatient: 6 },
      { id: 'dep-2', name: 'Cardiology & Heart OPD Room 208', currentServing: 11, totalWaiting: 5, avgTimePerPatient: 12 },
      { id: 'dep-3', name: 'Pediatrics / Child Care Room 112', currentServing: 18, totalWaiting: 4, avgTimePerPatient: 8 },
      { id: 'dep-4', name: 'Orthopedics & Fracture Clinic Room 302', currentServing: 9, totalWaiting: 6, avgTimePerPatient: 10 },
    ],
  },
  {
    id: 'hosp-2',
    name: 'Dr. Ram Manohar Lohia Institute (RMLIMS)',
    location: 'Vibhuti Khand, Gomti Nagar, Lucknow',
    distance: '9.4 km from BIET',
    city: 'Lucknow (226010)',
    departments: [
      { id: 'dep-5', name: 'General Medicine / OPD Room 101', currentServing: 42, totalWaiting: 9, avgTimePerPatient: 7 },
      { id: 'dep-6', name: 'Pulmonology & Chest Care Room 204', currentServing: 8, totalWaiting: 4, avgTimePerPatient: 10 },
      { id: 'dep-7', name: 'Neurology Department Room 315', currentServing: 5, totalWaiting: 3, avgTimePerPatient: 18 },
    ],
  },
  {
    id: 'hosp-3',
    name: 'Apollo Medics Super Speciality Hospital',
    location: 'Sector B, Bargawan, LDA Colony, Lucknow',
    distance: '14.5 km from BIET',
    city: 'Lucknow (226012)',
    departments: [
      { id: 'dep-8', name: 'Executive Health Checkup & OPD', currentServing: 15, totalWaiting: 3, avgTimePerPatient: 8 },
      { id: 'dep-9', name: 'Dermatology & Skin Center', currentServing: 19, totalWaiting: 5, avgTimePerPatient: 6 },
    ],
  },
  {
    id: 'hosp-4',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    location: 'Ansari Nagar, New Delhi',
    distance: '480 km',
    city: 'New Delhi',
    departments: [
      { id: 'dep-10', name: 'General Medicine / OPD Block A', currentServing: 85, totalWaiting: 22, avgTimePerPatient: 6 },
      { id: 'dep-11', name: 'Cardiology Super-Specialty', currentServing: 32, totalWaiting: 14, avgTimePerPatient: 15 },
    ],
  },
];

// EXTENSIVE 105+ PHARMACEUTICAL DRUGS DATABASE
export const INITIAL_MEDICINES: MedicineItem[] = EXTENSIVE_MEDICINES_DATABASE;

// REAL PHARMACIES NEAR BANSAL INSTITUTE OF ENGINEERING & TECHNOLOGY (BIET), LUCKNOW (PINCODE: 226021)
export const INITIAL_PHARMACIES: Pharmacy[] = [
  {
    id: 'pharm-1',
    name: 'Sewa Hospital Pharmacy & 24x7 Medical Depot',
    address: 'Sewa Hospital Complex, Sitapur Road, Mohibullapur, Lucknow',
    phone: '+91 88081 22445',
    distance: '0.15 km (150 meters)',
    distanceKm: 0.15,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Augmentin 625 Duo', 'Pantocid 40', 'Azithral 500', 'Combiflam', 'ORS Electral', 'Cetirizine', 'Telma 40', 'Glycomet GP 1', 'Insulin Cartridges'],
    isOpen24x7: true,
    lat: 26.9458,
    lng: 80.9258,
    landmark: 'Adjacent to BIET Main Campus, Inside Sewa Hospital Gate',
    pincode: '226021',
  },
  {
    id: 'pharm-2',
    name: 'Awadh Medicos & Surgical Hall',
    address: 'Shop 4, Institutional Market, Near BIET Main Gate, Sitapur Road, Lucknow',
    phone: '+91 94500 33211',
    distance: '0.2 km (200 meters)',
    distanceKm: 0.2,
    timing: '8:00 AM - 11:30 PM',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Crocin 500', 'Meftal Spas', 'Ascoril D Plus', 'Pan 40', 'Becosules Z', 'Betadine Ointment'],
    isOpen24x7: false,
    lat: 26.9465,
    lng: 80.9250,
    landmark: 'Opposite Bansal Institute Main Entrance',
    pincode: '226021',
  },
  {
    id: 'pharm-3',
    name: 'BIET Campus Student Wellness Chemist',
    address: 'Gate No. 2, Campus Amenities Center, Sitapur Road, Lucknow',
    phone: '+91 88081 99002',
    distance: '0.08 km (80 meters)',
    distanceKm: 0.08,
    timing: '8:00 AM - 10:00 PM',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Combiflam', 'Digene Gel', 'Bandages', 'Electral ORS', 'Volini Gel', 'Allegra 120'],
    isOpen24x7: false,
    lat: 26.9461,
    lng: 80.9254,
    landmark: 'Inside BIET Institutional Zone, Gate 2',
    pincode: '226021',
  },
  {
    id: 'pharm-4',
    name: 'Apollo Pharmacy 24x7 (Sitapur Road)',
    address: 'Plot 12, Near Sewa Hospital Road, Sitapur Road, Lucknow',
    phone: '+91 94150 28192',
    distance: '0.35 km (350 meters)',
    distanceKm: 0.35,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Augmentin 625 Duo', 'Pantocid 40', 'Azithral 500', 'Telma 40', 'Glycomet GP 1', 'Allegra 120', 'Montair LC', 'Insulin Cartridges'],
    isOpen24x7: true,
    lat: 26.9475,
    lng: 80.9265,
    landmark: '350 meters from BIET Campus, Adjacent to Sewa Hospital Road',
    pincode: '226021',
  },
  {
    id: 'pharm-5',
    name: 'City Care Chemist & Diagnostic Depot',
    address: 'Near Mohibullapur Railway Crossing, Sitapur Road, Lucknow',
    phone: '+91 98380 44120',
    distance: '0.45 km (450 meters)',
    distanceKm: 0.45,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Cefixime 200', 'Azithral 500', 'Pantocid DSR', 'Shelcal 500', 'Nebulizer Solution', 'ORS Electral'],
    isOpen24x7: true,
    lat: 26.9450,
    lng: 80.9268,
    landmark: 'Near Mohibullapur Rail Overbridge, Sitapur Road',
    pincode: '226021',
  },
  {
    id: 'pharm-6',
    name: 'Shri Ram Medical Hall & General Store',
    address: 'Sewa Hospital Chauraha, Sitapur Road, Lucknow',
    phone: '+91 94155 77123',
    distance: '0.32 km (320 meters)',
    distanceKm: 0.32,
    timing: '7:00 AM - 11:00 PM',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Combiflam', 'Voveran Plus', 'Omeprazole 20', 'Gelusil Liquid', 'Avil 25'],
    isOpen24x7: false,
    lat: 26.9448,
    lng: 80.9260,
    landmark: 'Next to Sewa Hospital Chauraha Traffic Signal',
    pincode: '226021',
  },
  {
    id: 'pharm-7',
    name: 'Sanjeevani Medical & Surgical Store 24x7',
    address: 'Sewa Hospital Crossing, Mohibullapur, Sitapur Road, Lucknow',
    phone: '+91 98390 12833',
    distance: '0.6 km',
    distanceKm: 0.6,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Pantocid 40', 'Combiflam', 'Ascoril D Plus', 'ORS Electral', 'Betadine', 'Nebulizer Kits'],
    isOpen24x7: true,
    lat: 26.9442,
    lng: 80.9278,
    landmark: '600m south of BIET near Sewa Hospital Chauraha',
    pincode: '226021',
  },
  {
    id: 'pharm-8',
    name: 'Pradhan Mantri Jan Aushadhi Kendra (Generic Meds)',
    address: 'Near Engineering College Chauraha, Mandi Samiti Marg, Sitapur Road, Lucknow',
    phone: '+91 94520 88991',
    distance: '1.1 km',
    distanceKm: 1.1,
    timing: '9:00 AM - 10:00 PM',
    stockStatus: 'In Stock',
    availableMedicines: ['Paracetamol 650', 'Amoxicillin 500', 'Pantoprazole 40', 'Metformin 500', 'Atorvastatin 10', 'Cetirizine 10', 'ORS'],
    isOpen24x7: false,
    lat: 26.9415,
    lng: 80.9212,
    landmark: '1.1 km from BIET towards Engineering College Chauraha',
    pincode: '226021',
  },
  {
    id: 'pharm-9',
    name: 'MedPlus Health & Wellness (Tedhi Pulia)',
    address: 'Tedhi Pulia Chauraha, Ring Road Junction, Lucknow',
    phone: '+91 97920 44556',
    distance: '1.4 km',
    distanceKm: 1.4,
    timing: '7:30 AM - 11:30 PM',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Augmentin 625 Duo', 'Telma 40', 'Allegra 120', 'Montair LC', 'Shelcal 500', 'Vicks Inhaler'],
    isOpen24x7: false,
    lat: 26.9385,
    lng: 80.9325,
    landmark: '1.4 km south-east at Tedhi Pulia Intersection',
    pincode: '226021',
  },
  {
    id: 'pharm-10',
    name: 'LifeCare Chemist & 24x7 Pharmacy (IIM Road Bypass)',
    address: 'IIM Road Crossing, Sitapur Road Bypass, Lucknow',
    phone: '+91 91250 67341',
    distance: '1.8 km',
    distanceKm: 1.8,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Azithral 500', 'Glycomet GP 1', 'Ascoril D Plus', 'Emergency Injections', 'Salbutamol Inhalers'],
    isOpen24x7: true,
    lat: 26.9515,
    lng: 80.9195,
    landmark: '1.8 km north at IIM Road / Sitapur Road Crossing',
    pincode: '226021',
  },
];

// 15 REALISTIC REGISTERED QUEUE PATIENTS WITH DETAILED CLINICAL PROBLEMS
export const INITIAL_QUEUE_PATIENTS: QueueToken[] = [
  {
    id: 'tok-p1',
    tokenNumber: 'A-020',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Rameshwar Nath',
    patientAge: 52,
    patientGender: 'Male',
    patientPhone: '+91 94150 11201',
    queuePosition: 0,
    currentServing: 20,
    estimatedWaitMinutes: 0,
    status: 'Serving Now',
    bookedAt: 'Today, 8:45 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'Chronic type-2 diabetes checkup, fasting glucose 235 mg/dL with bilateral foot tingling',
  },
  {
    id: 'tok-p2',
    tokenNumber: 'A-021',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Sunita Devi',
    patientAge: 46,
    patientGender: 'Female',
    patientPhone: '+91 98380 22302',
    queuePosition: 1,
    currentServing: 20,
    estimatedWaitMinutes: 4,
    status: 'Waiting',
    bookedAt: 'Today, 9:02 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'High grade viral fever (102.4°F) for 3 days with severe body chills and joint aches',
  },
  {
    id: 'tok-p3',
    tokenNumber: 'A-022',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Amit Kumar Verma',
    patientAge: 29,
    patientGender: 'Male',
    patientPhone: '+91 87654 33403',
    queuePosition: 2,
    currentServing: 20,
    estimatedWaitMinutes: 8,
    status: 'Waiting',
    bookedAt: 'Today, 9:15 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'Severe acidity, epigastric burning, acid reflux (GERD) and continuous sour belching',
  },
  {
    id: 'tok-p4',
    tokenNumber: 'A-023',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Pooja Sharma',
    patientAge: 34,
    patientGender: 'Female',
    patientPhone: '+91 91250 44504',
    queuePosition: 3,
    currentServing: 20,
    estimatedWaitMinutes: 12,
    status: 'Waiting',
    bookedAt: 'Today, 9:28 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'Unilateral throbbing migraine headache with photophobia, nausea and blurred vision',
  },
  {
    id: 'tok-p5',
    tokenNumber: 'A-024',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Kameshwar Gupta',
    patientAge: 23,
    patientGender: 'Male',
    patientPhone: '+91 88081 22445',
    queuePosition: 4,
    currentServing: 20,
    estimatedWaitMinutes: 16,
    status: 'Waiting',
    bookedAt: 'Today, 9:45 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'Mild anemia evaluation (Hb 11.8 g/dL), borderline cholesterol (215 mg/dL) and general fatigue',
  },
  {
    id: 'tok-p6',
    tokenNumber: 'A-025',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Mohd. Rizwan',
    patientAge: 61,
    patientGender: 'Male',
    patientPhone: '+91 99350 55605',
    queuePosition: 5,
    currentServing: 20,
    estimatedWaitMinutes: 20,
    status: 'Waiting',
    bookedAt: 'Today, 9:55 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'Uncontrolled hypertension (BP 165/105 mmHg) with occipital headache and dizziness',
  },
  {
    id: 'tok-p7',
    tokenNumber: 'A-026',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Anjali Srivastava',
    patientAge: 27,
    patientGender: 'Female',
    patientPhone: '+91 88990 66706',
    queuePosition: 6,
    currentServing: 20,
    estimatedWaitMinutes: 24,
    status: 'Waiting',
    bookedAt: 'Today, 10:05 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'Persistent dry allergic cough and nocturnal wheezing for 2 weeks',
  },
  {
    id: 'tok-p8',
    tokenNumber: 'A-027',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Brijesh Pandey',
    patientAge: 48,
    patientGender: 'Male',
    patientPhone: '+91 97920 77807',
    queuePosition: 7,
    currentServing: 20,
    estimatedWaitMinutes: 28,
    status: 'Waiting',
    bookedAt: 'Today, 10:12 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'Acute gastroenteritis, watery loose stools (5 episodes) with abdominal cramping',
  },
  {
    id: 'tok-p9',
    tokenNumber: 'A-028',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Kavita Chaurasia',
    patientAge: 38,
    patientGender: 'Female',
    patientPhone: '+91 94550 88908',
    queuePosition: 8,
    currentServing: 20,
    estimatedWaitMinutes: 32,
    status: 'Waiting',
    bookedAt: 'Today, 10:20 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'Hypothyroidism follow-up, elevated TSH (8.4 mIU/L), chronic lethargy and facial puffiness',
  },
  {
    id: 'tok-p10',
    tokenNumber: 'A-029',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Deepak Tiwari',
    patientAge: 41,
    patientGender: 'Male',
    patientPhone: '+91 93350 99009',
    queuePosition: 9,
    currentServing: 20,
    estimatedWaitMinutes: 36,
    status: 'Waiting',
    bookedAt: 'Today, 10:28 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'Bilateral knee joint swelling, morning stiffness and osteoarthritis pain',
  },
  {
    id: 'tok-p11',
    tokenNumber: 'A-030',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Ritu Singh',
    patientAge: 25,
    patientGender: 'Female',
    patientPhone: '+91 80090 10110',
    queuePosition: 10,
    currentServing: 20,
    estimatedWaitMinutes: 40,
    status: 'Waiting',
    bookedAt: 'Today, 10:35 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'Urinary tract infection (UTI), severe dysuria (burning sensation) and lower pelvic pain',
  },
  {
    id: 'tok-p12',
    tokenNumber: 'A-031',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Girish Chandra',
    patientAge: 58,
    patientGender: 'Male',
    patientPhone: '+91 96210 20211',
    queuePosition: 11,
    currentServing: 20,
    estimatedWaitMinutes: 44,
    status: 'Waiting',
    bookedAt: 'Today, 10:42 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'Right lumbar back spasm and sciatica radiation down to right calf',
  },
  {
    id: 'tok-p13',
    tokenNumber: 'A-032',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Shabana Khatoon',
    patientAge: 32,
    patientGender: 'Female',
    patientPhone: '+91 98890 30312',
    queuePosition: 12,
    currentServing: 20,
    estimatedWaitMinutes: 48,
    status: 'Waiting',
    bookedAt: 'Today, 10:50 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'Generalised urticaria, itchy allergic skin wheals after consuming seafood',
  },
  {
    id: 'tok-p14',
    tokenNumber: 'A-033',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Vikas Maurya',
    patientAge: 39,
    patientGender: 'Male',
    patientPhone: '+91 85740 40413',
    queuePosition: 13,
    currentServing: 20,
    estimatedWaitMinutes: 52,
    status: 'Waiting',
    bookedAt: 'Today, 10:58 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'Scleral yellowing, dark urine, suspected acute viral hepatitis / jaundice',
  },
  {
    id: 'tok-p15',
    tokenNumber: 'A-034',
    hospitalName: "King George's Medical University (KGMU), Lucknow",
    departmentName: 'General Medicine / OPD Room 104',
    patientName: 'Suresh Chandra Pal',
    patientAge: 65,
    patientGender: 'Male',
    patientPhone: '+91 91400 50514',
    queuePosition: 14,
    currentServing: 20,
    estimatedWaitMinutes: 56,
    status: 'Waiting',
    bookedAt: 'Today, 11:05 AM',
    doctorName: 'Dr. Sarah Khan (MD, FACP)',
    roomNumber: 'OPD Room 104',
    problem: 'Exertional dyspnea (breathlessness on climbing stairs) and mild bilateral pedal edema',
  },
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Khan',
    specialty: 'Internal Medicine & Critical Care',
    qualification: 'MBBS, MD (Medicine), FACP',
    experience: '16 Years',
    rating: 4.9,
    hospital: "King George's Medical University (KGMU), Lucknow",
    availableSlot: 'Today, 4:30 PM',
    consultationFee: '₹800',
    languages: ['English', 'Hindi', 'Urdu'],
  },
  {
    id: 'doc-2',
    name: 'Dr. Maya Williams',
    specialty: 'Cardiologist & Heart Specialist',
    qualification: 'MBBS, MD, DM (Cardiology)',
    experience: '12 Years',
    rating: 4.8,
    hospital: 'Apollo Medics Super Speciality Hospital, Lucknow',
    availableSlot: 'Tomorrow, 11:00 AM',
    consultationFee: '₹1200',
    languages: ['English', 'Hindi', 'Bengali'],
  },
  {
    id: 'doc-3',
    name: 'Dr. Ethan Chen',
    specialty: 'Pediatrician & Child Health',
    qualification: 'MBBS, DCH, MD (Pediatrics)',
    experience: '9 Years',
    rating: 4.7,
    hospital: 'Dr. Ram Manohar Lohia Institute (RMLIMS), Lucknow',
    availableSlot: 'Today, 6:00 PM',
    consultationFee: '₹700',
    languages: ['English', 'Hindi'],
  },
  {
    id: 'doc-4',
    name: 'Dr. Rajesh Deshmukh',
    specialty: 'Pulmonologist & Chest Physician',
    qualification: 'MBBS, MD (Pulmonary Medicine)',
    experience: '15 Years',
    rating: 4.9,
    hospital: 'Metro Chest Care Center, Lucknow',
    availableSlot: 'Friday, 10:00 AM',
    consultationFee: '₹950',
    languages: ['English', 'Hindi', 'Marathi'],
  },
];

// All pre-existing sample reports removed - AI Report Scanner strictly analyzes uploaded files
export const SAMPLE_REPORTS: MedicalReport[] = [];
