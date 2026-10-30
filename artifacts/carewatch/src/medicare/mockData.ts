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
  activeIngredients: string[];
  uses: string[];
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
    dosageForm: 'Oral Tablet',
    category: 'Antipyretic / Analgesic',
    activeIngredients: ['Paracetamol IP 650mg'],
    uses: ['High fever reduction', 'Headache & migraine relief', 'Body aches & toothache', 'Post-vaccination discomfort'],
    commonUses: 'Relief of mild to moderate fever, headache, body aches, and muscle pain.',
    precautions: [
      'Do not exceed 3-4 tablets in 24 hours (max 3000mg/day).',
      'Maintain at least 4-6 hours between doses.',
      'Take after light food to minimize gastric irritation.',
      'Avoid simultaneous consumption of alcohol.',
    ],
    warnings: [
      'Overdose can cause acute liver failure (hepatotoxicity).',
      'Do not combine with other paracetamol-containing cough syrups or cold medications.',
      'Consult a physician if fever lasts longer than 3 days.',
    ],
    storage: 'Store in a cool, dry place below 30°C away from direct sunlight.',
    price: '₹34 / strip of 15',
    confidenceScore: 98.4,
    similarSoundingMeds: ['Dolo-Cold', 'Dolopar 650', 'Dolamide'],
    verificationDate: 'Verified by National Drug Formulary (CDSCO) • Oct 2026',
  },
  {
    id: 'med-2',
    brandName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin + Clavulanic Acid',
    strength: '500mg + 125mg',
    dosageForm: 'Oral Tablet',
    category: 'Broad-Spectrum Antibiotic',
    activeIngredients: ['Amoxicillin Trihydrate IP 500mg', 'Clavulanate Potassium IP 125mg'],
    uses: ['Bacterial respiratory infections', 'Streptococcal tonsillitis & sinusitis', 'Ear (otitis media) & dental abscesses', 'Skin, soft tissue & urinary tract infections'],
    commonUses: 'Bacterial infections of throat, chest, ear, sinus, and urinary tract.',
    precautions: [
      'Complete the full 5-7 day course even if symptoms resolve earlier.',
      'Take strictly at the start of meals to enhance absorption and reduce nausea.',
      'Maintain good hydration throughout antibiotic therapy.',
    ],
    warnings: [
      'Contraindicated in patients with known Penicillin or cephalosporin allergies.',
      'Risk of antibiotic-associated diarrhea or fungal superinfection.',
      'Schedule H prescription medicine: requires valid medical practitioner prescription.',
    ],
    storage: 'Store in airtight blister pack below 25°C in a dry environment.',
    price: '₹210 / strip of 10',
    confidenceScore: 97.2,
    similarSoundingMeds: ['Augmentin 375', 'Amoxyclav 625', 'Moxclav 625'],
    verificationDate: 'Verified by National Drug Formulary (CDSCO) • Oct 2026',
  },
  {
    id: 'med-3',
    brandName: 'Pantocid 40',
    genericName: 'Pantoprazole Gastro-Resistant',
    strength: '40 mg',
    dosageForm: 'Delayed-Release Tablet',
    category: 'Proton Pump Inhibitor (Antacid)',
    activeIngredients: ['Pantoprazole Sodium IP 40mg'],
    uses: ['Gastroesophageal reflux disease (GERD)', 'Acid peptic disease & heartburn', 'Gastric and duodenal ulcer healing', 'NSAID-induced ulcer prevention'],
    commonUses: 'Acidity, heartburn, gastroesophageal reflux (GERD), and stomach ulcers.',
    precautions: [
      'Take 30 to 60 minutes before morning breakfast with plain water.',
      'Swallow whole: do not crush, chew, or break the enteric coating.',
      'Pair with dietary lifestyle modifications (avoid late heavy meals).',
    ],
    warnings: [
      'Prolonged unmonitored use may reduce calcium and vitamin B12 absorption.',
      'Report persistent stomach pain, unexplained weight loss, or difficulty swallowing.',
    ],
    storage: 'Store at room temperature below 25°C away from humidity.',
    price: '₹145 / strip of 15',
    confidenceScore: 99.1,
    similarSoundingMeds: ['Pantocid DSR', 'Pan 40', 'Pantodac 40'],
    verificationDate: 'Verified by National Drug Formulary (CDSCO) • Oct 2026',
  },
  {
    id: 'med-4',
    brandName: 'Azithral 500',
    genericName: 'Azithromycin',
    strength: '500 mg',
    dosageForm: 'Oral Tablet',
    category: 'Macrolide Antibiotic',
    activeIngredients: ['Azithromycin Dihydrate IP 500mg'],
    uses: ['Community-acquired pneumonia & bronchitis', 'Pharyngitis & tonsillar infection', 'Skin and soft tissue bacterial infections', 'Typhoid & genital tract infections'],
    commonUses: 'Respiratory tract infections, tonsillitis, bronchitis, and skin infections.',
    precautions: [
      'Take once daily at the same designated hour (1 hr before or 2 hrs after meals).',
      'Do not take aluminum- or magnesium-containing antacids simultaneously.',
    ],
    warnings: [
      'Do not discontinue the prescribed 3-day or 5-day regimen prematurely.',
      'Caution in patients with cardiac arrhythmia (QT prolongation) or severe liver impairment.',
    ],
    storage: 'Store in moisture-resistant package below 30°C.',
    price: '₹125 / strip of 5',
    confidenceScore: 96.8,
    similarSoundingMeds: ['Azee 500', 'Azithral 250', 'Azithrochem'],
    verificationDate: 'Verified by National Drug Formulary (CDSCO) • Oct 2026',
  },
  {
    id: 'med-5',
    brandName: 'Telma 40',
    genericName: 'Telmisartan',
    strength: '40 mg',
    dosageForm: 'Oral Tablet',
    category: 'Angiotensin II Receptor Blocker (Antihypertensive)',
    activeIngredients: ['Telmisartan IP 40mg'],
    uses: ['Essential hypertension (High Blood Pressure)', 'Cardiovascular mortality reduction in high-risk patients', 'Kidney protection in diabetic patients'],
    commonUses: 'High blood pressure management and cardiovascular risk reduction.',
    precautions: [
      'Take consistently at the same time every morning with or without food.',
      'Monitor blood pressure and serum potassium levels periodically.',
      'Avoid sudden abrupt discontinuation to prevent rebound hypertension.',
    ],
    warnings: [
      'Strictly contraindicated during pregnancy (causes fetal toxicity).',
      'Watch for dizziness when rising from sitting or lying position.',
    ],
    storage: 'Protect from direct light and moisture; store below 30°C.',
    price: '₹220 / strip of 30',
    confidenceScore: 98.6,
    similarSoundingMeds: ['Telma-H', 'Telma-AM', 'Telmikem 40'],
    verificationDate: 'Verified by National Drug Formulary (CDSCO) • Oct 2026',
  },
  {
    id: 'med-6',
    brandName: 'Glycomet GP 1',
    genericName: 'Glimepiride + Metformin SR',
    strength: '1mg + 500mg',
    dosageForm: 'Sustained-Release Tablet',
    category: 'Oral Anti-Diabetic Agent',
    activeIngredients: ['Glimepiride IP 1mg', 'Metformin Hydrochloride (Sustained Release) IP 500mg'],
    uses: ['Type 2 Diabetes Mellitus glycemic control', 'Post-meal and fasting blood glucose regulation', 'Insulin sensitivity improvement'],
    commonUses: 'Type 2 Diabetes mellitus blood sugar regulation.',
    precautions: [
      'Take with or immediately after the first main meal (breakfast).',
      'Always carry sugar cubes or glucose candy in case of hypoglycemia.',
      'Regularly monitor HbA1c and renal function.',
    ],
    warnings: [
      'Risk of hypoglycemia (sweating, trembling, dizziness, palpitation).',
      'Avoid excessive alcohol consumption (increases lactic acidosis risk).',
    ],
    storage: 'Store in dry condition below 25°C away from heat.',
    price: '₹135 / strip of 15',
    confidenceScore: 97.9,
    similarSoundingMeds: ['Glycomet 500', 'Glycomet GP 2', 'Glucophage'],
    verificationDate: 'Verified by National Drug Formulary (CDSCO) • Oct 2026',
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
    hospital: 'Apollo Heart Institute',
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
    hospital: 'Fortis Children Clinic',
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
    hospital: 'Metro Chest Care Center',
    availableSlot: 'Friday, 10:00 AM',
    consultationFee: '₹950',
    languages: ['English', 'Hindi', 'Marathi'],
  },
];

export const SAMPLE_REPORTS: MedicalReport[] = [
  {
    id: 'rep-1',
    patientName: 'Kameshwar Gupta',
    reportDate: 'Today, 10:30 AM',
    testType: 'Complete Blood Count (CBC) & Metabolic Panel',
    summary: 'Mild anemia detected due to slightly lower hemoglobin (11.8 g/dL). White Blood Cells (7,400 /mcL) and Platelets (220,000 /mcL) are healthy. Serum cholesterol is borderline high (215 mg/dL). Fasting blood sugar is normal (96 mg/dL).',
    overallStatus: 'Needs Attention',
    vitalsAndValues: [
      {
        test: 'Hemoglobin (Hb)',
        value: '11.8',
        unit: 'g/dL',
        referenceRange: '13.5 - 17.5',
        flag: 'Low',
        simpleExplanation: 'Hemoglobin carries oxygen in your blood. Slightly low indicates mild fatigue or iron deficiency anemia.',
      },
      {
        test: 'White Blood Cell (WBC)',
        value: '7,400',
        unit: '/mcL',
        referenceRange: '4,500 - 11,000',
        flag: 'Normal',
        simpleExplanation: 'WBC protects against infections. Your count indicates good immune defense.',
      },
      {
        test: 'Platelet Count',
        value: '220,000',
        unit: '/mcL',
        referenceRange: '150,000 - 450,000',
        flag: 'Normal',
        simpleExplanation: 'Helps blood clot normally. In optimal healthy range.',
      },
      {
        test: 'Fasting Blood Glucose',
        value: '96',
        unit: 'mg/dL',
        referenceRange: '70 - 99',
        flag: 'Normal',
        simpleExplanation: 'Normal fasting blood sugar level, showing healthy glucose metabolism.',
      },
      {
        test: 'Serum Cholesterol',
        value: '215',
        unit: 'mg/dL',
        referenceRange: '< 200',
        flag: 'High',
        simpleExplanation: 'Total cholesterol is slightly elevated. A balanced low-fat diet and regular physical activity are recommended.',
      },
    ],
    questionsForDoctor: [
      'Should I take dietary iron supplements for my mild anemia?',
      'What lifestyle modifications can bring my cholesterol below 200 mg/dL?',
      'Is any repeat testing recommended in 3 months?',
    ],
    lifestyleAdvice: [
      'Include iron-rich foods like spinach, lentils, pomegranate, and beetroot.',
      'Brisk walk for at least 30 minutes every morning.',
      'Maintain adequate hydration with 2.5 to 3 liters of water daily.',
    ],
  },
  {
    id: 'rep-2',
    patientName: 'Kameshwar Gupta',
    reportDate: 'Yesterday, 3:15 PM',
    testType: 'Comprehensive Lipid Profile & Heart Panel',
    summary: 'Serum Triglycerides are elevated at 220 mg/dL (normal < 150 mg/dL). LDL Bad Cholesterol is 135 mg/dL (borderline). HDL Good Cholesterol is 42 mg/dL. Cardiovascular lifestyle adjustments advised.',
    overallStatus: 'Needs Attention',
    vitalsAndValues: [
      {
        test: 'Serum Triglycerides',
        value: '220',
        unit: 'mg/dL',
        referenceRange: '< 150',
        flag: 'High',
        simpleExplanation: 'Blood fats stored from excess calories. Elevated triglycerides require reduction of refined sugars and fried foods.',
      },
      {
        test: 'LDL Bad Cholesterol',
        value: '135',
        unit: 'mg/dL',
        referenceRange: '< 100',
        flag: 'High',
        simpleExplanation: 'Can slowly build up on artery walls. Target is to lower below 100 mg/dL.',
      },
      {
        test: 'HDL Good Cholesterol',
        value: '42',
        unit: 'mg/dL',
        referenceRange: '> 40',
        flag: 'Normal',
        simpleExplanation: 'Protects blood vessels by transporting excess cholesterol to liver. Within acceptable limits.',
      },
      {
        test: 'Total / HDL Ratio',
        value: '4.6',
        unit: 'ratio',
        referenceRange: '< 5.0',
        flag: 'Normal',
        simpleExplanation: 'Cardiovascular risk ratio is in the acceptable average zone.',
      },
    ],
    questionsForDoctor: [
      'Do I need statins or can diet and exercise resolve my elevated triglycerides?',
      'Should I test for fatty liver or metabolic syndrome?',
    ],
    lifestyleAdvice: [
      'Cut down on sweetened beverages, refined flours, and deep-fried snacks.',
      'Incorporate Omega-3 rich foods like flaxseeds, walnuts, or fish.',
      'Engage in 150 minutes of moderate aerobic workout weekly.',
    ],
  },
  {
    id: 'rep-3',
    patientName: 'Kameshwar Gupta',
    reportDate: '12 Oct 2026',
    testType: 'Glycated Hemoglobin (HbA1c) & Diabetic Panel',
    summary: 'HbA1c is 5.4%, confirming optimal non-diabetic glycemic regulation over the last 90 days. Fasting blood sugar is 92 mg/dL and post-prandial glucose is 124 mg/dL. Metabolic parameters are excellent.',
    overallStatus: 'Normal',
    vitalsAndValues: [
      {
        test: 'HbA1c (Average 3-Month Sugar)',
        value: '5.4',
        unit: '%',
        referenceRange: '< 5.7',
        flag: 'Normal',
        simpleExplanation: 'Reflects average blood sugar over the last 90 days. Normal non-diabetic range.',
      },
      {
        test: 'Fasting Plasma Glucose',
        value: '92',
        unit: 'mg/dL',
        referenceRange: '70 - 99',
        flag: 'Normal',
        simpleExplanation: 'Healthy resting blood glucose level.',
      },
      {
        test: 'Post-Prandial Blood Sugar (PPBS)',
        value: '124',
        unit: 'mg/dL',
        referenceRange: '< 140',
        flag: 'Normal',
        simpleExplanation: 'Blood sugar 2 hours after a meal. Normal response indicating good insulin sensitivity.',
      },
    ],
    questionsForDoctor: [
      'At what interval should annual preventive diabetic screening continue?',
    ],
    lifestyleAdvice: [
      'Continue balanced nutritional intake with complex carbohydrates.',
      'Maintain regular sleep schedule and physical fitness.',
    ],
  },
];
