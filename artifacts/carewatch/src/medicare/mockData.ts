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
  status: 'Waiting' | 'In Consultation' | 'Completed' | 'Cancelled';
  bookedAt: string;
}

export interface MedicineItem {
  id: string;
  brandName: string;
  genericName: string;
  strength: string;
  dosageForm: string;
  category: string;
  commonUses: string;
  precautions: string;
  warnings: string;
  storage: string;
  price: string;
  image?: string;
}

export interface Pharmacy {
  id: string;
  name: string;
  address: string;
  phone: string;
  distance: string;
  timing: string;
  stockStatus: 'In Stock' | 'Limited Stock' | 'Out of Stock';
  availableMedicines: string[];
  lat: number;
  lng: number;
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
  active: boolean;
}

// Initial Mock Data
export const INITIAL_HOSPITALS: Hospital[] = [
  {
    id: 'hosp-1',
    name: 'All India Institute of Medical Sciences (AIIMS)',
    location: 'Ansari Nagar, New Delhi',
    distance: '2.4 km',
    departments: [
      { id: 'dep-1', name: 'General Medicine / OPD', currentServing: 24, totalWaiting: 12, avgTimePerPatient: 8 },
      { id: 'dep-2', name: 'Cardiology & Heart Care', currentServing: 11, totalWaiting: 7, avgTimePerPatient: 15 },
      { id: 'dep-3', name: 'Pediatrics / Child Care', currentServing: 18, totalWaiting: 5, avgTimePerPatient: 10 },
      { id: 'dep-4', name: 'Orthopedics & Bone Clinic', currentServing: 9, totalWaiting: 8, avgTimePerPatient: 12 },
    ],
  },
  {
    id: 'hosp-2',
    name: 'Apollo Multi-Specialty Hospital',
    location: 'Sector 26, City Center',
    distance: '4.8 km',
    departments: [
      { id: 'dep-5', name: 'General Medicine / OPD', currentServing: 42, totalWaiting: 9, avgTimePerPatient: 7 },
      { id: 'dep-6', name: 'Pulmonology / Chest Care', currentServing: 8, totalWaiting: 6, avgTimePerPatient: 12 },
      { id: 'dep-7', name: 'Neurology Department', currentServing: 5, totalWaiting: 4, avgTimePerPatient: 20 },
    ],
  },
  {
    id: 'hosp-3',
    name: 'Fortis Healthcare Hospital',
    location: 'Ring Road, Metro Junction',
    distance: '6.1 km',
    departments: [
      { id: 'dep-8', name: 'ENT & Ophthalmology', currentServing: 15, totalWaiting: 6, avgTimePerPatient: 10 },
      { id: 'dep-9', name: 'Dermatology & Skin', currentServing: 19, totalWaiting: 11, avgTimePerPatient: 8 },
    ],
  },
];

export const INITIAL_MEDICINES: MedicineItem[] = [
  {
    id: 'med-1',
    brandName: 'Dolo 650',
    genericName: 'Paracetamol',
    strength: '650 mg',
    dosageForm: 'Tablet',
    category: 'Antipyretic / Analgesic',
    commonUses: 'Relief of mild to moderate fever, headache, body aches, and muscle pain.',
    precautions: 'Do not exceed 3 tablets in 24 hours without doctor recommendation. Avoid alcohol.',
    warnings: 'Overdose may cause liver damage. Consult a doctor if fever lasts more than 3 days.',
    storage: 'Store in a cool, dry place away from direct sunlight.',
    price: '?34 / strip of 15',
  },
  {
    id: 'med-2',
    brandName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin + Clavulanic Acid',
    strength: '500mg + 125mg',
    dosageForm: 'Tablet',
    category: 'Antibiotic',
    commonUses: 'Bacterial infections of throat, chest, ear, sinus, and urinary tract.',
    precautions: 'Complete full prescribed course even if feeling better. Take with meals to avoid stomach upset.',
    warnings: 'Do not take if allergic to Penicillin. Requires doctor prescription.',
    storage: 'Store below 25°C in moisture-proof packaging.',
    price: '?210 / strip of 10',
  },
  {
    id: 'med-3',
    brandName: 'Pantocid 40',
    genericName: 'Pantoprazole',
    strength: '40 mg',
    dosageForm: 'Tablet',
    category: 'Proton Pump Inhibitor (Antacid)',
    commonUses: 'Acidity, heartburn, gastroesophageal reflux (GERD), and stomach ulcers.',
    precautions: 'Best taken 30-60 minutes before breakfast with a glass of water.',
    warnings: 'Long-term continuous use without consultation may impact magnesium/B12 levels.',
    storage: 'Store at room temperature away from moisture.',
    price: '?145 / strip of 15',
  },
  {
    id: 'med-4',
    brandName: 'Azithral 500',
    genericName: 'Azithromycin',
    strength: '500 mg',
    dosageForm: 'Tablet',
    category: 'Macrolide Antibiotic',
    commonUses: 'Respiratory tract infections, tonsillitis, bronchitis, and skin infections.',
    precautions: 'Take once daily at the same time. Drink plenty of water.',
    warnings: 'Do not discontinue early. Consult doctor if unusual heart rhythm occurs.',
    storage: 'Store in dry place below 30°C.',
    price: '?125 / strip of 5',
  },
  {
    id: 'med-5',
    brandName: 'Telma 40',
    genericName: 'Telmisartan',
    strength: '40 mg',
    dosageForm: 'Tablet',
    category: 'Antihypertensive',
    commonUses: 'High blood pressure management and cardiovascular risk reduction.',
    precautions: 'Check blood pressure regularly. Do not stop abruptly.',
    warnings: 'Not recommended during pregnancy. Keep hydrated.',
    storage: 'Protect from light and moisture.',
    price: '?220 / strip of 30',
  },
  {
    id: 'med-6',
    brandName: 'Glycomet GP 1',
    genericName: 'Glimepiride + Metformin',
    strength: '1mg + 500mg',
    dosageForm: 'Tablet',
    category: 'Anti-Diabetic',
    commonUses: 'Type 2 Diabetes mellitus blood sugar regulation.',
    precautions: 'Take immediately before or with the morning meal.',
    warnings: 'Watch out for low blood sugar symptoms (dizziness, sweating). Keep glucose candies handy.',
    storage: 'Store below 25°C.',
    price: '?135 / strip of 15',
  },
];

export const INITIAL_PHARMACIES: Pharmacy[] = [
  {
    id: 'pharm-1',
    name: 'Apollo Pharmacy 24x7',
    address: 'Ground Floor, Ring Road Metro Station, Gate 2',
    phone: '+91 98765 43210',
    distance: '0.6 km',
    timing: 'Open 24 Hours',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Augmentin 625 Duo', 'Pantocid 40', 'Azithral 500', 'Telma 40'],
    lat: 28.6139,
    lng: 77.2090,
  },
  {
    id: 'pharm-2',
    name: 'MedPlus Health & Wellness',
    address: 'Shop 14, Main Market, Sector 12',
    phone: '+91 98111 22334',
    distance: '1.2 km',
    timing: '8:00 AM - 11:00 PM',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Pantocid 40', 'Glycomet GP 1', 'Telma 40'],
    lat: 28.6189,
    lng: 77.2150,
  },
  {
    id: 'pharm-3',
    name: 'Sanjivani Chemist & Druggist',
    address: 'Opposite AIIMS Emergency Gate',
    phone: '+91 98450 99887',
    distance: '2.1 km',
    timing: 'Open 24 Hours',
    stockStatus: 'Limited Stock',
    availableMedicines: ['Dolo 650', 'Augmentin 625 Duo', 'Azithral 500'],
    lat: 28.6250,
    lng: 77.2100,
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
    hospital: 'AIIMS New Delhi',
    availableSlot: 'Today, 4:30 PM',
    consultationFee: '?800',
    languages: ['English', 'Hindi', 'Urdu'],
  },
  {
    id: 'doc-2',
    name: 'Dr. Maya Williams',
    specialty: 'Cardiologist & Heart Specialist',
    qualification: 'MBBS, MD, DM (Cardiology)',
    experience: '12 Years',
    rating: 4.8,
    hospital: 'Apollo Heart Institute',
    availableSlot: 'Tomorrow, 11:00 AM',
    consultationFee: '?1200',
    languages: ['English', 'Hindi', 'Bengali'],
  },
  {
    id: 'doc-3',
    name: 'Dr. Ethan Chen',
    specialty: 'Pediatrician & Child Health',
    qualification: 'MBBS, DCH, MD (Pediatrics)',
    experience: '9 Years',
    rating: 4.7,
    hospital: 'Fortis Children Clinic',
    availableSlot: 'Today, 6:00 PM',
    consultationFee: '?700',
    languages: ['English', 'Hindi'],
  },
  {
    id: 'doc-4',
    name: 'Dr. Rajesh Deshmukh',
    specialty: 'Pulmonologist & Chest Physician',
    qualification: 'MBBS, MD (Pulmonary Medicine)',
    experience: '15 Years',
    rating: 4.9,
    hospital: 'Metro Chest Care Center',
    availableSlot: 'Friday, 10:00 AM',
    consultationFee: '?950',
    languages: ['English', 'Hindi', 'Marathi'],
  },
];

export const SAMPLE_REPORTS: MedicalReport[] = [
  {
    id: 'rep-1',
    patientName: 'Kameshwar Gupta',
    reportDate: 'Today, 10:30 AM',
    testType: 'Complete Blood Count (CBC) & Metabolic Panel',
    summary: 'Mild anemia detected due to slightly lower hemoglobin. Platelets, WBC, and blood sugar are within safe limits.',
    overallStatus: 'Needs Attention',
    vitalsAndValues: [
      {
        test: 'Hemoglobin (Hb)',
        value: '11.8',
        unit: 'g/dL',
        referenceRange: '13.5 - 17.5',
        flag: 'Low',
        simpleExplanation: 'Hemoglobin carries oxygen in your blood. Slightly low means mild tiredness or mild anemia.',
      },
      {
        test: 'White Blood Cell (WBC)',
        value: '7,400',
        unit: '/mcL',
        referenceRange: '4,500 - 11,000',
        flag: 'Normal',
        simpleExplanation: 'WBC fights body infections. Your immune defense cell count is perfectly healthy.',
      },
      {
        test: 'Platelet Count',
        value: '220,000',
        unit: '/mcL',
        referenceRange: '150,000 - 450,000',
        flag: 'Normal',
        simpleExplanation: 'Platelets help with blood clotting and stop bleeding. Levels are normal.',
      },
      {
        test: 'Fasting Blood Glucose',
        value: '96',
        unit: 'mg/dL',
        referenceRange: '70 - 99',
        flag: 'Normal',
        simpleExplanation: 'Blood sugar level after overnight fasting. Perfectly within healthy range.',
      },
      {
        test: 'Serum Cholesterol',
        value: '215',
        unit: 'mg/dL',
        referenceRange: '< 200',
        flag: 'High',
        simpleExplanation: 'Total cholesterol is slightly elevated. A balanced low-fat diet and daily walking is recommended.',
      },
    ],
    questionsForDoctor: [
      'Should I start iron supplements for my hemoglobin level?',
      'What dietary changes will help reduce my cholesterol naturally?',
      'When should I repeat this blood test?',
    ],
    lifestyleAdvice: [
      'Include iron-rich foods: spinach, pomegranate, lentils, beetroot.',
      'Exercise or brisk walk 30 minutes every morning.',
      'Stay hydrated with at least 2.5 - 3 liters of water daily.',
    ],
  },
];
