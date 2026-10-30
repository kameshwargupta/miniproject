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
  status: 'Waiting' | 'Serving Now' | 'In Consultation' | 'Completed' | 'Cancelled';
  bookedAt: string;
  doctorName?: string;
  roomNumber?: string;
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
      { id: 'dep-1', name: 'General Medicine / OPD Room 104', currentServing: 24, totalWaiting: 8, avgTimePerPatient: 6 },
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

export const INITIAL_MEDICINES: MedicineItem[] = [
  {
    id: 'med-1',
    brandName: 'Dolo 650',
    genericName: 'Paracetamol',
    strength: '650 mg',
    dosageForm: 'Oral Tablet',
    category: 'Antipyretic / Analgesic (Fever & Pain)',
    activeIngredients: ['Paracetamol IP 650mg'],
    uses: [
      'Reduction of high fever from viral infections, colds, and flu',
      'Relief of mild to moderate headache, toothache, and body aches',
      'Post-vaccination pain and malaise',
      'Osteoarthritis and joint discomfort'
    ],
    howToTake: 'Take 1 tablet orally with a glass of water after food. Maintain at least 4 to 6 hours between doses. Do not exceed 3 tablets (2000mg) in 24 hours without medical supervision. Do not crush or chew.',
    commonUses: 'Relief of fever, headache, body aches, muscle pains, and post-vaccine fever.',
    precautions: [
      'Never exceed 3000mg total paracetamol in a single day.',
      'Maintain at least 4 to 6 hours gap between consecutive doses.',
      'Take after food or a light snack to prevent gastric irritation.',
      'Avoid simultaneous consumption of alcohol.'
    ],
    warnings: [
      'Excessive dose or overdose can cause severe and irreversible acute liver damage.',
      'Do not combine with other cold syrups, fever drops, or analgesics containing paracetamol.',
      'Consult a physician if fever lasts longer than 3 days.'
    ],
    storage: 'Store in a cool, dry place below 30°C away from direct sunlight.',
    price: '₹34 for 15 tablets',
    confidenceScore: 99.2,
    similarSoundingMeds: ['Dolo 500', 'Dolopar', 'Dolo-Cold', 'Calpol 650'],
    verificationDate: '30 Oct 2026',
  },
  {
    id: 'med-2',
    brandName: 'Augmentin 625 Duo',
    genericName: 'Amoxicillin + Clavulanic Acid',
    strength: '500 mg + 125 mg',
    dosageForm: 'Film-Coated Tablet',
    category: 'Broad-Spectrum Antibiotic',
    activeIngredients: ['Amoxicillin Trihydrate 500mg', 'Clavulanate Potassium 125mg'],
    uses: [
      'Bacterial respiratory tract infections (sinusitis, bronchitis, pneumonia)',
      'Ear, nose, and throat (ENT) infections such as severe tonsillitis and otitis media',
      'Urinary tract infections (UTI)',
      'Skin, soft tissue, and dental abscess infections'
    ],
    howToTake: 'Take 1 tablet twice daily (every 12 hours) strictly at the start of a meal to reduce stomach upset and enhance absorption. Swallow whole with water. Complete the entire 5 to 7 days course prescribed by your doctor even if you feel better.',
    commonUses: 'Treatment of bacterial infections of the lungs, ears, throat, urinary tract, and skin.',
    precautions: [
      'Take strictly at the start of a meal to prevent gastrointestinal upset and nausea.',
      'Complete the entire prescribed 5-7 days course; do not stop early to avoid antibiotic resistance.',
      'Drink plenty of fluids throughout the day.'
    ],
    warnings: [
      'Contraindicated in patients with known penicillin or beta-lactam allergies.',
      'May cause diarrhea or mild stomach cramping; consult doctor if persistent watery stools occur.'
    ],
    storage: 'Store below 25°C in a dry place. Protect from moisture.',
    price: '₹204 for 10 tablets',
    confidenceScore: 98.4,
    similarSoundingMeds: ['Amoxyclav 625', 'Moxikind-CV 625', 'Clavam 625'],
    verificationDate: '28 Oct 2026',
  },
  {
    id: 'med-3',
    brandName: 'Pantocid 40',
    genericName: 'Pantoprazole Sodium',
    strength: '40 mg',
    dosageForm: 'Gastro-Resistant Tablet',
    category: 'Proton Pump Inhibitor (Antacid / Anti-Ulcer)',
    activeIngredients: ['Pantoprazole Sodium Sesquihydrate IP equivalent to Pantoprazole 40mg'],
    uses: [
      'Gastroesophageal Reflux Disease (GERD) and chronic acid reflux',
      'Heartburn, chest burning, and acid regurgitation',
      'Peptic, gastric, and duodenal ulcers',
      'Prevention of stomach ulcers caused by painkillers (NSAIDs)'
    ],
    howToTake: 'Take 1 tablet once daily in the morning, 30 to 60 minutes before breakfast on an empty stomach. Swallow whole with water. Do not crush, break, or chew the tablet as it has a special enteric coating.',
    commonUses: 'Relief from acidity, heartburn, sour burps, and stomach ulcer prevention.',
    precautions: [
      'Take strictly on an empty stomach 30-60 minutes before breakfast.',
      'Swallow whole; do not crush, break, or chew the enteric-coated tablet.',
      'Avoid high-fat, spicy, or fried meals and late-night snacking.'
    ],
    warnings: [
      'Long-term continuous use (> 1 year) may decrease magnesium and vitamin B12 absorption.',
      'Consult a doctor if heartburn symptoms persist after 14 consecutive days.'
    ],
    storage: 'Store in a cool dry place below 25°C. Keep protected from moisture and light.',
    price: '₹165 for 15 tablets',
    confidenceScore: 99.0,
    similarSoundingMeds: ['Pan 40', 'Pantop 40', 'Pantodac 40', 'Pan-D'],
    verificationDate: '29 Oct 2026',
  },
  {
    id: 'med-4',
    brandName: 'Azithral 500',
    genericName: 'Azithromycin',
    strength: '500 mg',
    dosageForm: 'Film-Coated Tablet',
    category: 'Macrolide Antibiotic',
    activeIngredients: ['Azithromycin IP 500mg'],
    uses: [
      'Upper and lower respiratory tract bacterial infections',
      'Bacterial pharyngitis, tonsillitis, and acute sinusitis',
      'Community-acquired pneumonia and acute bronchitis',
      'Skin, soft tissue, and genital infections'
    ],
    howToTake: 'Take 1 tablet once daily at the same time each day, either 1 hour before a meal or 2 hours after a meal with a full glass of water. Typically taken for a 3-day or 5-day course as directed by your physician.',
    commonUses: 'Treatment of bacterial throat infections, chest infections, sinusitis, and bronchitis.',
    precautions: [
      'Take at the same fixed time each day.',
      'Do not take antacids containing aluminum or magnesium at the same time (maintain 2-hour gap).'
    ],
    warnings: [
      'Inform your doctor if you have liver disease or heart rhythm (QT prolongation) issues.',
      'Not effective against viral infections like common cold or viral flu.'
    ],
    storage: 'Store below 30°C in a dry place.',
    price: '₹125 for 5 tablets',
    confidenceScore: 97.8,
    similarSoundingMeds: ['Azee 500', 'Zady 500', 'Azimax 500'],
    verificationDate: '25 Oct 2026',
  },
  {
    id: 'med-5',
    brandName: 'Telma 40',
    genericName: 'Telmisartan',
    strength: '40 mg',
    dosageForm: 'Oral Tablet',
    category: 'Angiotensin II Receptor Blocker (Antihypertensive)',
    activeIngredients: ['Telmisartan IP 40mg'],
    uses: [
      'Management of essential hypertension (High Blood Pressure)',
      'Reduction of cardiovascular risk in patients with coronary artery disease',
      'Protection of kidney function in hypertensive diabetic patients'
    ],
    howToTake: 'Take 1 tablet once daily, preferably at the same time every morning, with or without food. Swallow whole with water. Do not stop abruptly without consulting your cardiologist.',
    commonUses: 'Blood pressure control and long-term heart and kidney protection.',
    precautions: [
      'Monitor blood pressure regularly at home.',
      'Avoid sudden standing up to prevent dizziness due to blood pressure drops.',
      'Maintain adequate hydration unless restricted by doctor.'
    ],
    warnings: [
      'Strictly contraindicated during pregnancy (can cause fetal harm).',
      'Check serum potassium and kidney function periodically.'
    ],
    storage: 'Store below 30°C away from moisture.',
    price: '₹188 for 15 tablets',
    confidenceScore: 98.9,
    similarSoundingMeds: ['Telmikind 40', 'Telsar 40', 'Telpres 40', 'Telma-H'],
    verificationDate: '26 Oct 2026',
  },
  {
    id: 'med-6',
    brandName: 'Glycomet GP 1',
    genericName: 'Metformin + Glimepiride',
    strength: '500 mg + 1 mg',
    dosageForm: 'Sustained-Release Tablet',
    category: 'Oral Anti-Diabetic (Type 2 Diabetes)',
    activeIngredients: ['Glimepiride IP 1mg', 'Metformin Hydrochloride IP 500mg (SR)'],
    uses: [
      'Management of Type 2 Diabetes Mellitus',
      'Controlling elevated fasting and post-meal blood glucose levels',
      'Reducing long-term diabetes microvascular complications'
    ],
    howToTake: 'Take 1 tablet once daily with or immediately after breakfast or the first main meal of the day. Swallow whole; do not break, chew, or crush the sustained-release tablet. Always carry candy or glucose powder in case of hypoglycemia.',
    commonUses: 'Control of blood sugar in Type 2 Diabetes.',
    precautions: [
      'Take strictly with or immediately after breakfast/first meal.',
      'Do not skip meals after taking this medication to prevent low blood sugar (hypoglycemia).',
      'Carry candy or glucose tablets in case you experience sudden sweating or dizziness.'
    ],
    warnings: [
      'Avoid heavy alcohol consumption as it increases risk of lactic acidosis and severe hypoglycemia.',
      'Check HbA1c and fasting sugar every 3 months.'
    ],
    storage: 'Store in a cool and dry place below 25°C.',
    price: '₹145 for 15 tablets',
    confidenceScore: 99.1,
    similarSoundingMeds: ['Glador M 1', 'Zoryl-M 1', 'Amaryl M 1'],
    verificationDate: '27 Oct 2026',
  },
  {
    id: 'med-7',
    brandName: 'Combiflam',
    genericName: 'Ibuprofen + Paracetamol',
    strength: '400 mg + 325 mg',
    dosageForm: 'Oral Tablet',
    category: 'NSAID & Analgesic (Anti-inflammatory & Pain)',
    activeIngredients: ['Ibuprofen IP 400mg', 'Paracetamol IP 325mg'],
    uses: [
      'Relief of intense musculoskeletal pain, sprains, and backache',
      'Dental pain and post-extraction pain',
      'Arthritic joint inflammation and swelling',
      'Severe headache, period pain (dysmenorrhea), and fever'
    ],
    howToTake: 'Take 1 tablet 2 to 3 times a day strictly after meals with plenty of water. Do not take on an empty stomach. Do not exceed 3 tablets in 24 hours. Keep a gap of 8 hours between doses.',
    commonUses: 'Relief of intense muscular aches, joint swelling, back pain, and dental toothache.',
    precautions: [
      'Always take after a full meal to protect stomach lining from acidity and ulcers.',
      'Drink a full glass of water with each dose.',
      'Use for the shortest duration necessary.'
    ],
    warnings: [
      'Contraindicated in active stomach ulcers, severe kidney disease, or asthma triggered by aspirin.',
      'Do not take during late pregnancy.'
    ],
    storage: 'Store in a dry place below 25°C.',
    price: '₹48 for 20 tablets',
    confidenceScore: 99.0,
    similarSoundingMeds: ['Flexon', 'Ibugesic Plus', 'Brufen Plus'],
    verificationDate: '29 Oct 2026',
  },
  {
    id: 'med-8',
    brandName: 'Allegra 120',
    genericName: 'Fexofenadine Hydrochloride',
    strength: '120 mg',
    dosageForm: 'Film-Coated Tablet',
    category: 'Non-Sedating Antihistamine (Anti-Allergy)',
    activeIngredients: ['Fexofenadine HCl IP 120mg'],
    uses: [
      'Relief of seasonal allergic rhinitis (sneezing, runny nose, watery eyes)',
      'Chronic allergic hives, skin itching, and red allergic rashes (urticaria)',
      'Dust, pollen, and pet allergy relief'
    ],
    howToTake: 'Take 1 tablet once daily with water before food or as directed by doctor. Avoid taking with fruit juices (such as grapefruit, orange, or apple juice) as they decrease medicine absorption. Can be taken during daytime as it causes minimal to no drowsiness.',
    commonUses: 'Allergy relief for runny nose, sneezing, itchy skin rashes, and hives.',
    precautions: [
      'Take with plain water; avoid taking with citrus juices.',
      'Do not take antacids containing aluminum or magnesium within 2 hours.'
    ],
    warnings: [
      'Safe and non-drowsy for most adults; however, check personal tolerance before driving.'
    ],
    storage: 'Store in original container below 25°C.',
    price: '₹210 for 10 tablets',
    confidenceScore: 98.6,
    similarSoundingMeds: ['Fexova 120', 'Fexigra 120', 'Histafree 120'],
    verificationDate: '24 Oct 2026',
  },
  {
    id: 'med-9',
    brandName: 'Montair LC',
    genericName: 'Montelukast + Levocetirizine',
    strength: '10 mg + 5 mg',
    dosageForm: 'Oral Tablet',
    category: 'Leukotriene Receptor Antagonist + Antiallergic',
    activeIngredients: ['Montelukast Sodium 10mg', 'Levocetirizine Dihydrochloride 5mg'],
    uses: [
      'Allergic rhinitis with nocturnal nasal congestion and persistent sneezing',
      'Allergic asthma maintenance and wheezing prevention',
      'Chronic allergic cough and post-nasal drip'
    ],
    howToTake: 'Take 1 tablet once daily at bedtime (night) with or without food. Swallow whole with water. Taking at bedtime helps control night-time coughing and nasal block while managing mild drowsiness.',
    commonUses: 'Relief of persistent night-time allergy, blocked nose, wheezing, and allergic cough.',
    precautions: [
      'Best taken at bedtime because levocetirizine can induce mild sleepiness.',
      'Do not consume alcohol while taking this medicine.'
    ],
    warnings: [
      'Not a rescue inhaler for acute sudden asthma attacks.',
      'Inform doctor if you experience unusual mood changes or agitation.'
    ],
    storage: 'Store in a dry dark place below 25°C.',
    price: '₹225 for 10 tablets',
    confidenceScore: 98.2,
    similarSoundingMeds: ['Telekast-L', 'Monticope', 'Romilast-L'],
    verificationDate: '28 Oct 2026',
  },
  {
    id: 'med-10',
    brandName: 'Ascoril D Plus',
    genericName: 'Dextromethorphan + Chlorpheniramine + Phenylephrine',
    strength: '10mg + 2mg + 5mg / 5ml',
    dosageForm: 'Oral Cough Syrup',
    category: 'Dry Cough Suppressant & Decongestant',
    activeIngredients: ['Dextromethorphan HBr 10mg', 'Chlorpheniramine Maleate 2mg', 'Phenylephrine HCl 5mg per 5ml'],
    uses: [
      'Dry, irritating, hacking cough without phlegm',
      'Nasal congestion, throat tickle, and blocked sinuses due to upper respiratory allergies',
      'Watery eyes and allergic sneezing associated with cough'
    ],
    howToTake: 'Adults: Take 10ml (2 teaspoonfuls) 2 to 3 times daily using the provided measuring cup, after food. Do not drink water immediately for 10-15 minutes after taking syrup to allow soothing coating on throat lining. Shake bottle well before use.',
    commonUses: 'Relief of dry irritating cough, throat tickle, and blocked nose.',
    precautions: [
      'Use the provided measuring cup for accurate dosage.',
      'May cause mild drowsiness; avoid operating machinery immediately after taking.'
    ],
    warnings: [
      'Do not use for productive (wet) chesty cough with heavy mucus/phlegm.',
      'Do not exceed recommended dose.'
    ],
    storage: 'Store in a cool place protected from light. Keep cap tightly closed.',
    price: '₹140 for 100 ml bottle',
    confidenceScore: 98.5,
    similarSoundingMeds: ['Benadryl DR', 'Corex DX', 'Zedex D'],
    verificationDate: '26 Oct 2026',
  },
  {
    id: 'med-11',
    brandName: 'ORS Electral',
    genericName: 'Oral Rehydration Salts IP (WHO Formula)',
    strength: '21.8 g Sachet',
    dosageForm: 'Oral Powder for Solution',
    category: 'Electrolyte Replenisher & Rehydration',
    activeIngredients: ['Sodium Chloride 2.6g', 'Potassium Chloride 1.5g', 'Sodium Citrate 2.9g', 'Dextrose Anhydrous 13.5g per sachet'],
    uses: [
      'Restoration of body fluids and essential electrolytes lost due to diarrhea or loose motions',
      'Dehydration relief from vomiting, gastroenteritis, or excessive sweating and heat exhaustion',
      'Post-workout or travel electrolyte replenishing'
    ],
    howToTake: 'Dissolve the entire contents of 1 sachet in exactly 1 Liter of clean boiled and cooled drinking water. Stir thoroughly until completely dissolved. Sip slowly throughout the day. Discard any unused prepared solution after 24 hours. Do not mix with milk, soup, or fruit juice.',
    commonUses: 'Immediate rehydration and electrolyte balance during dehydration, diarrhea, and vomiting.',
    precautions: [
      'Always prepare in exactly 1 liter of water; do not make it too concentrated or too diluted.',
      'Use within 24 hours of preparation.'
    ],
    warnings: [
      'Use with caution in severe kidney failure or congestive heart failure under medical advice.'
    ],
    storage: 'Store in a dry place. Protect from moisture.',
    price: '₹22 per sachet',
    confidenceScore: 99.8,
    similarSoundingMeds: ['Prolyte ORS', 'Walyte ORS', 'Enerzal'],
    verificationDate: '30 Oct 2026',
  },
];

// REAL PHARMACIES NEAR BANSAL INSTITUTE OF ENGINEERING & TECHNOLOGY (BIET), LUCKNOW (PINCODE: 226021)
export const INITIAL_PHARMACIES: Pharmacy[] = [
  {
    id: 'pharm-1',
    name: 'Bansal Medicos & Healthcare (BIET Gate)',
    address: 'Shop 2, Institutional Complex, Near BIET Main Gate, Sitapur Road, Lucknow',
    phone: '+91 88081 22445',
    distance: '0.1 km (100 meters)',
    distanceKm: 0.1,
    timing: '8:00 AM - 11:30 PM',
    stockStatus: 'In Stock',
    availableMedicines: ['Dolo 650', 'Augmentin 625 Duo', 'Pantocid 40', 'Azithral 500', 'Combiflam', 'ORS Electral', 'Cetirizine'],
    isOpen24x7: false,
    lat: 26.9460,
    lng: 80.9250,
    landmark: 'Opposite Bansal Institute of Engineering & Technology (BIET) Main Gate',
    pincode: '226021',
  },
  {
    id: 'pharm-2',
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
    id: 'pharm-3',
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
    id: 'pharm-4',
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
    id: 'pharm-5',
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
    id: 'pharm-6',
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

export const SAMPLE_REPORTS: MedicalReport[] = [
  {
    id: 'rep-1',
    patientName: 'Kameshwar Gupta',
    reportDate: 'Today, 10:30 AM',
    testType: 'Complete Blood Count (CBC) & Metabolic Panel',
    summary: 'Mild anemia detected due to slightly lower hemoglobin (11.8 g/dL). White Blood Cells (7,400 /mcL) and Platelets (220,000 /mcL) are in healthy normal ranges. Serum cholesterol is borderline high (215 mg/dL). Fasting blood sugar is normal (96 mg/dL).',
    mainPoints: [
      'Low Hemoglobin (11.8 g/dL vs normal 13.5-17.5 g/dL): Indicates mild nutritional iron deficiency anemia causing tiredness.',
      'Immune System & Clotting Healthy: White Blood Cells (7,400) and Platelets (2.2 Lakhs) are completely normal.',
      'Mild Borderline Cholesterol (215 mg/dL vs normal < 200 mg/dL): Requires reduction of saturated oil and 30 mins brisk walking.',
      'Kidney & Sugar Optimal: Fasting glucose (96 mg/dL) shows excellent diabetic control.',
      'Urgent Action: No emergency hospital admission required. Start dietary iron (spinach, beetroot, pomegranate) and retest in 60 days.'
    ],
    overallStatus: 'Needs Attention',
    vitalsAndValues: [
      {
        test: 'Hemoglobin (Hb)',
        value: '11.8',
        unit: 'g/dL',
        referenceRange: '13.5 - 17.5',
        flag: 'Low',
        simpleExplanation: 'Carries oxygen through your bloodstream. Low count explains occasional fatigue and mild weakness.',
      },
      {
        test: 'White Blood Cell (WBC)',
        value: '7,400',
        unit: '/mcL',
        referenceRange: '4,500 - 11,000',
        flag: 'Normal',
        simpleExplanation: 'Fights off viral and bacterial infections. Good immune defenses.',
      },
      {
        test: 'Platelet Count',
        value: '220,000',
        unit: '/mcL',
        referenceRange: '150,000 - 450,000',
        flag: 'Normal',
        simpleExplanation: 'Ensures proper blood clotting and wound recovery. Healthy optimal zone.',
      },
      {
        test: 'Fasting Blood Glucose',
        value: '96',
        unit: 'mg/dL',
        referenceRange: '70 - 99',
        flag: 'Normal',
        simpleExplanation: 'Morning fasting blood sugar shows normal glucose metabolism.',
      },
      {
        test: 'Serum Cholesterol',
        value: '215',
        unit: 'mg/dL',
        referenceRange: '< 200',
        flag: 'High',
        simpleExplanation: 'Total cholesterol is slightly elevated. Low-fat diet and morning walks recommended.',
      },
    ],
    questionsForDoctor: [
      'Should I take an oral iron supplement for my mild anemia (11.8 g/dL)?',
      'What specific diet changes will bring my total cholesterol below 200 mg/dL without medicine?',
      'Do you recommend repeating this CBC test in 2 months?'
    ],
    lifestyleAdvice: [
      'Eat iron-rich foods: green leafy vegetables, lentils, dates, jaggery, and beetroot.',
      'Walk briskly for 30 minutes every morning to improve good HDL cholesterol.',
      'Drink 2.5 to 3 liters of fresh water daily.'
    ],
  },
  {
    id: 'rep-2',
    patientName: 'Kameshwar Gupta',
    reportDate: 'Yesterday, 3:15 PM',
    testType: 'Comprehensive Lipid Profile & Heart Panel',
    summary: 'Serum Triglycerides are elevated at 220 mg/dL (normal < 150 mg/dL). LDL Bad Cholesterol is 135 mg/dL (borderline high). HDL Good Cholesterol is 42 mg/dL. Cardiovascular lifestyle modification advised.',
    mainPoints: [
      'High Triglycerides (220 mg/dL vs normal < 150 mg/dL): Indicates excess stored calories from sweets, sodas, or fried foods.',
      'Borderline LDL Bad Cholesterol (135 mg/dL vs normal < 100 mg/dL): Can accumulate on arterial walls over years.',
      'Cardiovascular Risk Ratio Normal (4.6 vs normal < 5.0): Heart function is currently protected.',
      'Urgent Action: Cut refined sugar, switch to mustard/olive oil, exercise 150 mins/week. Retest lipid profile in 90 days.'
    ],
    overallStatus: 'Needs Attention',
    vitalsAndValues: [
      {
        test: 'Serum Triglycerides',
        value: '220',
        unit: 'mg/dL',
        referenceRange: '< 150',
        flag: 'High',
        simpleExplanation: 'Blood fats from stored calories. Needs reduction of sweets and fried snacks.',
      },
      {
        test: 'LDL Bad Cholesterol',
        value: '135',
        unit: 'mg/dL',
        referenceRange: '< 100',
        flag: 'High',
        simpleExplanation: 'Can narrow arteries if neglected over time. Target is below 100.',
      },
      {
        test: 'HDL Good Cholesterol',
        value: '42',
        unit: 'mg/dL',
        referenceRange: '> 40',
        flag: 'Normal',
        simpleExplanation: 'Protects blood vessels by carrying fat to liver for breakdown.',
      },
      {
        test: 'Total / HDL Ratio',
        value: '4.6',
        unit: 'ratio',
        referenceRange: '< 5.0',
        flag: 'Normal',
        simpleExplanation: 'Overall heart risk ratio remains in the safe zone.',
      },
    ],
    questionsForDoctor: [
      'Do my elevated triglycerides require statin medication or can exercise alone reverse it?',
      'Should I undergo an ultrasound for fatty liver evaluation?'
    ],
    lifestyleAdvice: [
      'Eliminate trans fats, bakery pastries, and deep-fried samosas.',
      'Include Omega-3 sources like flaxseeds, walnuts, and almonds.',
      'Do 150 minutes of moderate aerobic workout every week.'
    ],
  },
  {
    id: 'rep-3',
    patientName: 'Kameshwar Gupta',
    reportDate: '12 Oct 2026',
    testType: 'Glycated Hemoglobin (HbA1c) & Diabetic Panel',
    summary: 'HbA1c is 5.4%, confirming optimal non-diabetic glycemic regulation over the past 90 days. Fasting blood sugar is 92 mg/dL and post-meal glucose is 124 mg/dL. Metabolic parameters are excellent.',
    mainPoints: [
      'Non-Diabetic HbA1c (5.4% vs normal < 5.7%): Excellent long-term 90-day glycemic stability.',
      'Normal Fasting Sugar (92 mg/dL vs normal 70-99 mg/dL): Pancreatic insulin production is healthy.',
      'Normal Post-Prandial Sugar (124 mg/dL vs normal < 140 mg/dL): Body absorbs carbohydrates efficiently.',
      'Urgent Action: No medication required. Maintain current balanced diet and active lifestyle.'
    ],
    overallStatus: 'Normal',
    vitalsAndValues: [
      {
        test: 'HbA1c (3-Month Sugar)',
        value: '5.4',
        unit: '%',
        referenceRange: '< 5.7',
        flag: 'Normal',
        simpleExplanation: 'Reflects average glucose over the last 90 days. Healthy non-diabetic range.',
      },
      {
        test: 'Fasting Plasma Glucose',
        value: '92',
        unit: 'mg/dL',
        referenceRange: '70 - 99',
        flag: 'Normal',
        simpleExplanation: 'Morning blood sugar shows proper insulin regulation.',
      },
      {
        test: 'Post-Prandial Glucose (2hr)',
        value: '124',
        unit: 'mg/dL',
        referenceRange: '< 140',
        flag: 'Normal',
        simpleExplanation: 'Blood sugar 2 hours after lunch is completely within safe limits.',
      },
    ],
    questionsForDoctor: [
      'How frequently should I check my HbA1c considering family diabetes history?'
    ],
    lifestyleAdvice: [
      'Continue complex carbohydrates like oats, brown rice, and whole wheat.',
      'Stay physically active to maintain insulin sensitivity.'
    ],
  },
];
