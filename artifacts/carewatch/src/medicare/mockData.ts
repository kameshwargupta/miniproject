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
  lat: number;
  lng: number;
  pincode?: string;
  phone?: string;
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
  hospitalId?: string;
  hospitalName?: string;
  isHospitalInHouse?: boolean;
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
    id: 'hosp-5',
    name: 'Sewa Hospital & Trauma Emergency',
    location: 'Sitapur Road, Mohibullapur, Adjacent to BIET Campus, Lucknow',
    distance: '0.15 km from BIET',
    city: 'Lucknow (226021)',
    lat: 26.9458,
    lng: 80.9258,
    pincode: '226021',
    phone: '+91 88081 22445',
    departments: [
      { id: 'dep-12', name: 'General Medicine / Trauma Desk Room 03', currentServing: 14, totalWaiting: 3, avgTimePerPatient: 5 },
      { id: 'dep-13', name: 'Emergency ICU & Critical Care Room 01', currentServing: 8, totalWaiting: 2, avgTimePerPatient: 10 },
      { id: 'dep-14', name: 'Orthopedics & Fracture Clinic Room 06', currentServing: 19, totalWaiting: 4, avgTimePerPatient: 7 },
    ],
  },
  {
    id: 'hosp-1',
    name: "King George's Medical University (KGMU)",
    location: 'Shah Mina Road, Chowk, Lucknow',
    distance: '6.2 km from BIET',
    city: 'Lucknow (226003)',
    lat: 26.8694,
    lng: 80.9161,
    pincode: '226003',
    phone: '0522-2257540',
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
    lat: 26.8530,
    lng: 80.9995,
    pincode: '226010',
    phone: '0522-6692000',
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
    lat: 26.7820,
    lng: 80.8920,
    pincode: '226012',
    phone: '0522-6788888',
    departments: [
      { id: 'dep-8', name: 'Executive Health Checkup & OPD', currentServing: 15, totalWaiting: 3, avgTimePerPatient: 8 },
      { id: 'dep-9', name: 'Dermatology & Skin Center', currentServing: 19, totalWaiting: 5, avgTimePerPatient: 6 },
    ],
  },
  {
    id: 'hosp-4',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    location: 'Ansari Nagar, New Delhi',
    distance: '480 km from BIET',
    city: 'New Delhi (110029)',
    lat: 28.5672,
    lng: 77.2100,
    pincode: '110029',
    phone: '011-26588500',
    departments: [
      { id: 'dep-10', name: 'General Medicine / OPD Block A', currentServing: 85, totalWaiting: 22, avgTimePerPatient: 6 },
      { id: 'dep-11', name: 'Cardiology Super-Specialty', currentServing: 32, totalWaiting: 14, avgTimePerPatient: 15 },
    ],
  },
];

export const INITIAL_MEDICINES: MedicineItem[] = EXTENSIVE_MEDICINES_DATABASE;

// REAL PHARMACIES NEAR BANSAL INSTITUTE OF ENGINEERING & TECHNOLOGY (BIET), LUCKNOW (PINCODE: 226021)
export const INITIAL_PHARMACIES: Pharmacy[] = [
  // SEWA HOSPITAL & BIET CAMPUS (LUCKNOW - 226021)
  {
    id: 'pharm-1',
    name: 'Sewa Hospital Pharmacy & 24x7 Medical Depot',
    address: 'Sewa Hospital Complex, Sitapur Road, Mohibullapur, Lucknow',
    phone: '+91 88081 22445',
    distance: '0.15 km (In-House)',
    distanceKm: 0.15,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Augmentin 625 Duo', 'Pantocid 40', 'Azithral 500', 'Combiflam', 'ORS Electral', 'Cetirizine', 'Telma 40', 'Glycomet GP 1', 'Insulin Cartridges'],
    isOpen24x7: true,
    lat: 26.9458,
    lng: 80.9258,
    landmark: 'Adjacent to BIET Main Campus, Inside Sewa Hospital Gate',
    pincode: '226021',
    hospitalId: 'hosp-5',
    hospitalName: 'Sewa Hospital & Trauma Emergency',
    isHospitalInHouse: true,
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
    hospitalId: 'hosp-5',
    hospitalName: 'Sewa Hospital & Trauma Emergency',
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
    hospitalId: 'hosp-5',
    hospitalName: 'Sewa Hospital & Trauma Emergency',
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
    hospitalId: 'hosp-5',
    hospitalName: 'Sewa Hospital & Trauma Emergency',
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
    hospitalId: 'hosp-5',
    hospitalName: 'Sewa Hospital & Trauma Emergency',
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
    hospitalId: 'hosp-5',
    hospitalName: 'Sewa Hospital & Trauma Emergency',
  },
  {
    id: 'pharm-7',
    name: 'Sanjeevani Medical & Surgical Store 24x7',
    address: 'Sewa Hospital Crossing, Mohibullapur, Sitapur Road, Lucknow',
    phone: '+91 98390 12833',
    distance: '0.6 km (600 meters)',
    distanceKm: 0.6,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Pantocid 40', 'Combiflam', 'Ascoril D Plus', 'ORS Electral', 'Betadine', 'Nebulizer Kits'],
    isOpen24x7: true,
    lat: 26.9442,
    lng: 80.9278,
    landmark: '600m south of BIET near Sewa Hospital Chauraha',
    pincode: '226021',
    hospitalId: 'hosp-5',
    hospitalName: 'Sewa Hospital & Trauma Emergency',
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
    hospitalId: 'hosp-5',
    hospitalName: 'Sewa Hospital & Trauma Emergency',
  },

  // KING GEORGE'S MEDICAL UNIVERSITY (KGMU) PHARMACIES (LUCKNOW - 226003)
  {
    id: 'pharm-kgmu-1',
    name: 'KGMU Central 24x7 In-House Hospital Pharmacy',
    address: 'Ground Floor, OPD Block, KGMU Medical Campus, Chowk, Lucknow',
    phone: '0522-2257540',
    distance: 'In-House (Ground Floor)',
    distanceKm: 0.05,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Augmentin 625 Duo', 'Pantocid 40', 'Ceftriaxone Inj', 'Insulin Glargine', 'Telma 40', 'Atorva 20', 'ORS WHO', 'Combiflam', 'Amoxyclav 625'],
    isOpen24x7: true,
    lat: 26.8695,
    lng: 80.9163,
    landmark: 'Inside KGMU OPD Central Building, Chowk',
    pincode: '226003',
    hospitalId: 'hosp-1',
    hospitalName: "King George's Medical University (KGMU)",
    isHospitalInHouse: true,
  },
  {
    id: 'pharm-kgmu-2',
    name: 'Chowk Super 24x7 Medicos & Trauma Chemist',
    address: 'Opposite KGMU Trauma Center Gate 2, Shah Mina Road, Lucknow',
    phone: '+91 94151 88201',
    distance: '0.1 km (100 meters)',
    distanceKm: 0.1,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Meftal Spas', 'Azithral 500', 'Pan 40', 'Dynapar AQ Inj', 'Bandages & Surgical Kits', 'Human Albumin'],
    isOpen24x7: true,
    lat: 26.8702,
    lng: 80.9170,
    landmark: 'Opposite KGMU Trauma Emergency Center',
    pincode: '226003',
    hospitalId: 'hosp-1',
    hospitalName: "King George's Medical University (KGMU)",
  },
  {
    id: 'pharm-kgmu-3',
    name: 'Jan Aushadhi Generic Pharmacy (KGMU Gate 4)',
    address: 'Shah Mina Road, Near KGMU Gate 4, Chowk, Lucknow',
    phone: '+91 98390 44211',
    distance: '0.2 km',
    distanceKm: 0.2,
    timing: '8:00 AM - 10:00 PM',
    stockStatus: 'In Stock',
    availableMedicines: ['Paracetamol 650', 'Pantoprazole 40', 'Metformin 500', 'Amlodipine 5', 'Cetirizine 10', 'ORS Electral'],
    isOpen24x7: false,
    lat: 26.8688,
    lng: 80.9155,
    landmark: '200m from KGMU Gate 4 on Shah Mina Road',
    pincode: '226003',
    hospitalId: 'hosp-1',
    hospitalName: "King George's Medical University (KGMU)",
  },

  // DR. RAM MANOHAR LOHIA INSTITUTE (RMLIMS) PHARMACIES (LUCKNOW - 226010)
  {
    id: 'pharm-rml-1',
    name: 'RMLIMS 24x7 In-House Hospital Pharmacy',
    address: 'Hospital Lobby Block A, RMLIMS, Vibhuti Khand, Gomti Nagar, Lucknow',
    phone: '0522-6692000',
    distance: 'In-House (Hospital Lobby)',
    distanceKm: 0.05,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Augmentin 625 Duo', 'Pantocid 40', 'Azithral 500', 'Telma 40', 'Glycomet GP 1', 'Meropenem Inj', 'Human Insulin', 'ORS'],
    isOpen24x7: true,
    lat: 26.8532,
    lng: 80.9997,
    landmark: 'Inside RMLIMS Main Hospital Building, Gomti Nagar',
    pincode: '226010',
    hospitalId: 'hosp-2',
    hospitalName: 'Dr. Ram Manohar Lohia Institute (RMLIMS)',
    isHospitalInHouse: true,
  },
  {
    id: 'pharm-rml-2',
    name: 'Apollo Pharmacy 24x7 (Gomti Nagar RML Road)',
    address: 'Plot 5, Near RMLIMS Gate 1, Vibhuti Khand, Gomti Nagar, Lucknow',
    phone: '+91 94155 33019',
    distance: '0.15 km (150 meters)',
    distanceKm: 0.15,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Crocin 650', 'Allegra 120', 'Combiflam', 'Pan 40', 'Becosules Z', 'Volini Spray'],
    isOpen24x7: true,
    lat: 26.8538,
    lng: 81.0005,
    landmark: '150 meters from RMLIMS Gate 1',
    pincode: '226010',
    hospitalId: 'hosp-2',
    hospitalName: 'Dr. Ram Manohar Lohia Institute (RMLIMS)',
  },
  {
    id: 'pharm-rml-3',
    name: 'Sanjeevani Medicos & Lifeline Chemist',
    address: 'Opposite RMLIMS Trauma Center, Gomti Nagar, Lucknow',
    phone: '+91 98381 22904',
    distance: '0.3 km',
    distanceKm: 0.3,
    timing: '7:30 AM - 11:30 PM',
    stockStatus: 'In Stock',
    availableMedicines: ['Augmentin 625', 'Pantocid DSR', 'Shelcal 500', 'Voveran Plus', 'Betadine', 'Nebulizer Solution'],
    isOpen24x7: false,
    lat: 26.8524,
    lng: 80.9988,
    landmark: 'Near RMLIMS Trauma Exit Gate',
    pincode: '226010',
    hospitalId: 'hosp-2',
    hospitalName: 'Dr. Ram Manohar Lohia Institute (RMLIMS)',
  },

  // APOLLO MEDICS SUPER SPECIALITY HOSPITAL PHARMACIES (LUCKNOW - 226012)
  {
    id: 'pharm-apollo-1',
    name: 'Apollo Medics 24x7 In-House Super Pharmacy',
    address: 'Ground Floor, OPD Main Lobby, Apollo Medics Hospital, Sector B, LDA Colony, Lucknow',
    phone: '0522-6788888',
    distance: 'In-House (OPD Entrance)',
    distanceKm: 0.05,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Augmentin 625 Duo', 'Pantocid 40', 'Telma AM', 'Glycomet Trio', 'Rosuvas 10', 'Insulin Pen Needles', 'Ecosprin 75'],
    isOpen24x7: true,
    lat: 26.7822,
    lng: 80.8923,
    landmark: 'Inside Apollo Medics Hospital Ground Floor',
    pincode: '226012',
    hospitalId: 'hosp-3',
    hospitalName: 'Apollo Medics Super Speciality Hospital',
    isHospitalInHouse: true,
  },
  {
    id: 'pharm-apollo-2',
    name: 'Kanpur Road 24x7 Medicos & Chemist Depot',
    address: 'Opposite Apollo Medics Hospital Gate, Kanpur Road, LDA Colony, Lucknow',
    phone: '+91 94150 77112',
    distance: '0.2 km (200 meters)',
    distanceKm: 0.2,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Combiflam', 'Ascoril D Plus', 'Pan D', 'Cetirizine 10', 'Electral ORS', 'Bandages'],
    isOpen24x7: true,
    lat: 26.7830,
    lng: 80.8935,
    landmark: 'Directly Opposite Apollo Medics on Kanpur Road',
    pincode: '226012',
    hospitalId: 'hosp-3',
    hospitalName: 'Apollo Medics Super Speciality Hospital',
  },

  // ALL INDIA INSTITUTE OF MEDICAL SCIENCES (AIIMS) PHARMACIES (NEW DELHI - 110029)
  {
    id: 'pharm-aiims-1',
    name: 'AIIMS Central In-House 24x7 Pharmacy (Amrit Store)',
    address: 'Block A, Ground Floor, AIIMS Complex, Ansari Nagar, New Delhi',
    phone: '011-26588500',
    distance: 'In-House (Block A)',
    distanceKm: 0.05,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Augmentin 625 Duo', 'Pantocid 40', 'Azithral 500', 'Telma 40', 'Glycomet 500', 'Insulin Glargine', 'Oncology Supportive Drugs', 'Cardiac Stent Care'],
    isOpen24x7: true,
    lat: 28.5674,
    lng: 77.2105,
    landmark: 'Inside AIIMS OPD Block A, Ansari Nagar',
    pincode: '110029',
    hospitalId: 'hosp-4',
    hospitalName: 'All India Institute of Medical Sciences (AIIMS)',
    isHospitalInHouse: true,
  },
  {
    id: 'pharm-aiims-2',
    name: 'Safdarjung Road 24x7 Chemist Depot',
    address: 'Ring Road, Near AIIMS Metro Gate 2, Ansari Nagar, New Delhi',
    phone: '+91 98110 55432',
    distance: '0.25 km (250 meters)',
    distanceKm: 0.25,
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Combiflam', 'Cefixime 200', 'Pan 40', 'Surgical Gloves & Disposables', 'ORS'],
    isOpen24x7: true,
    lat: 28.5685,
    lng: 77.2120,
    landmark: '250 meters from AIIMS Metro Station Gate 2',
    pincode: '110029',
    hospitalId: 'hosp-4',
    hospitalName: 'All India Institute of Medical Sciences (AIIMS)',
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
