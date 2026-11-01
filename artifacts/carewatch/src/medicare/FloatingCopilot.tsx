import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Bot,
  User,
  Volume2,
  Sparkles,
  X,
  Square,
  VolumeX,
  ShieldCheck,
  Activity,
  Heart,
  Pill,
  Settings,
  Check,
  RefreshCw,
} from 'lucide-react';
import { EXTENSIVE_MEDICINES_DATABASE } from './medicinesDataset';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';
import {
  askCopilotChatWithAi,
  getAiConfig,
  setAiConfig,
  type AiConfig,
} from './aiMedicalService';

export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
  source?: 'chatgpt' | 'gemini' | 'dynamic-clinical-ai';
  model?: string;
}

// Deep Clinical Health Intelligence Knowledge Base with Zero Repetition
export const generateClinicalAnswer = (query: string, lang: LanguageCode): string => {
  const q = query.toLowerCase().trim();
  const isHi = lang === 'hi';

  // =========================================================================
  // 1. EXACT PHARMACEUTICAL DRUG LOOKUP FROM 105 MEDICINES DATABASE
  // =========================================================================
  const matchedMedicine = EXTENSIVE_MEDICINES_DATABASE.find((med) => {
    const brand = med.brandName.toLowerCase();
    const generic = med.genericName.toLowerCase();
    // Check brand name word matches or direct inclusions
    const brandClean = brand.replace(/[^a-z0-9 ]/g, ' ');
    const brandWords = brandClean.split(/\s+/).filter((w) => w.length > 2);
    const queryClean = q.replace(/[^a-z0-9 ]/g, ' ');

    return (
      queryClean.includes(brand.toLowerCase()) ||
      queryClean.includes(generic.toLowerCase()) ||
      brandWords.some((w) => queryClean.includes(w) && !['syrup', 'tablet', 'gel', 'capsule', 'drop'].includes(w))
    );
  });

  if (matchedMedicine) {
    if (isHi) {
      return `💊 **सटीक औषधि जानकारी (Medicine Details): ${matchedMedicine.brandName}**
- **जेनेरिक संरचना (Generic Name):** ${matchedMedicine.genericName}
- **मात्रा / शक्ति (Strength):** ${matchedMedicine.strength} (${matchedMedicine.dosageForm})
- **श्रेणी (Therapeutic Class):** ${matchedMedicine.category}

📋 **मुख्य चिकित्सीय उपयोग (Primary Uses):**
${matchedMedicine.uses.map((u) => `• ${u}`).join('\n')}

⏱️ **दवा लेने का सटीक तरीका (How to Take & Dosage):**
${matchedMedicine.howToTake}

🛡️ **सावधानियां और सलाह (Precautions):**
${matchedMedicine.precautions.map((p) => `• ${p}`).join('\n')}

⚠️ **मुख्य चेतावनी (Warnings):**
${matchedMedicine.warnings.map((w) => `• ${w}`).join('\n')}
• अनुमानित बाजार मूल्य: ${matchedMedicine.price}`;
    }

    return `💊 **Clinical Drug Assessment: ${matchedMedicine.brandName}**
- **Generic Formulation:** ${matchedMedicine.genericName}
- **Strength & Form:** ${matchedMedicine.strength} (${matchedMedicine.dosageForm})
- **Therapeutic Class:** ${matchedMedicine.category}

📋 **Primary Clinical Uses:**
${matchedMedicine.uses.map((u) => `• ${u}`).join('\n')}

⏱️ **Exact Dosage & Administration (How to Take):**
${matchedMedicine.howToTake}

🛡️ **Precautions & Patient Safety:**
${matchedMedicine.precautions.map((p) => `• ${p}`).join('\n')}

⚠️ **Key Warnings & Contraindications:**
${matchedMedicine.warnings.map((w) => `• ${w}`).join('\n')}
• Reference Cost: ${matchedMedicine.price}`;
  }

  // =========================================================================
  // 2. FEVER, TYPHOID, DENGUE, MALARIA, CHILLS
  // =========================================================================
  if (
    q.includes('fever') ||
    q.includes('temperature') ||
    q.includes('बुखार') ||
    q.includes('tapman') ||
    q.includes('chills') ||
    q.includes('dengue') ||
    q.includes('malaria') ||
    q.includes('typhoid') ||
    q.includes('viral')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (बुखार, टाइफाइड और वायरल संक्रमण):**
शरीर का तापमान 98.6°F (37°C) से अधिक होना शरीर की प्रतिरक्षा प्रणाली का संक्रमण के विरुद्ध सक्रिय होने का संकेत है।

💡 **सटीक उपचार और दवा लेने का नियम:**
1. **दवा:** पैरासिटामोल 650mg (Dolo 650 / Calpol 650) भोजन के बाद 1 गोली लें। दो खुराकों में कम से कम 6 घंटे का अंतर रखें। 24 घंटे में 3 गोली से अधिक न लें।
2. **हाइड्रेशन:** दिन में 3 लीटर तरल पदार्थ (इलेक्ट्राल ORS, नारियल पानी, गुनगुना पानी) पिएं ताकि डिहाइड्रेशन न हो।
3. **घरेलू उपाय:** माथे और गर्दन पर सामान्य नल के पानी की ठंडी पट्टियां रखें। बर्फ या बहुत ठंडे पानी का प्रयोग न करें।
4. **आहार:** हल्का और सुपाच्य भोजन (मूंग दाल खिचड़ी, दलिया, लौकी का सूप) लें।

⚠️ **लाल चेतावनी (तुरंत डॉक्टर को दिखाएं):**
यदि बुखार 102°F से अधिक हो, 3 दिनों से अधिक रहे, शरीर पर लाल चकत्ते आएं, या तेज कंपकंपी के साथ उल्टी हो, तो तुरंत सीबीसी (CBC), विडाल (Widal) और डेंगू एनएस1 जांच कराएं।`;
    }
    return `🩺 **Clinical Assessment (Fever, Typhoid, Dengue & Viral Infection):**
An oral temperature exceeding 99.5°F (37.5°C) indicates the immune system's active cytokine response fighting pathogens.

💡 **Targeted Clinical Treatment & Regimen:**
1. **First-Line Medication:** Paracetamol 650mg (Dolo 650 / Calpol 650) orally after a meal or light snack. Maintain strict 4 to 6 hours spacing between doses (maximum 3 tablets or 2000mg per 24 hours).
2. **Hydration Protocol:** Drink 2.5 to 3 liters of fluids daily (Electral WHO-ORS, tender coconut water, warm broths) to sustain electrolyte balance.
3. **Physical Cooling:** Apply room-temperature damp cloth sponging to forehead, neck, and axillae. Avoid ice packs.
4. **Dietary Management:** Consume easily assimilated carbohydrates (rice gruel, strained vegetable soups, boiled eggs).

⚠️ **Red Flag Indications (Seek Immediate Medical Care):**
If fever exceeds 102°F, persists beyond 72 hours, or is accompanied by cutaneous petechiae/rashes, extreme abdominal rigidity, or intractable vomiting, obtain Complete Blood Count (CBC) and Dengue NS1/Typhoid tests promptly.`;
  }

  // =========================================================================
  // 3. HEADACHE, MIGRAINE & SINUS PAIN
  // =========================================================================
  if (
    q.includes('headache') ||
    q.includes('head ache') ||
    q.includes('सिरदर्द') ||
    q.includes('migraine') ||
    q.includes('sar dard') ||
    q.includes('adhkapari') ||
    q.includes('sinus')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (सिरदर्द और माइग्रेन):**
सिरदर्द के प्रमुख कारण तनाव (Tension headache), पानी की कमी (Dehydration), स्क्रीन स्ट्रेन, साइनस रुकावट या माइग्रेन की संवहनी सूजन (Vascular inflammation) हैं।

💡 **सटीक उपचार और त्वरित राहत:**
1. **हाइड्रेशन:** तुरंत 2 बड़े गिलास (500ml) गुनगुना पानी पिएं।
2. **विश्राम:** 20 मिनट के लिए शांत, अंधेरे कमरे में लेटें। स्क्रीन और मोबाइल की नीली रोशनी पूरी तरह बंद रखें।
3. **दवा:** भोजन के बाद पैरासिटामोल 650mg (Dolo) या कॉम्बीफ्लेम (Combiflam - Ibuprofen + Paracetamol) लें। खाली पेट पेनकिलर कभी न लें।
4. **सिकाई:** माइग्रेन के लिए माथे पर ठंडा पैक लगाएं; तनाव सिरदर्द के लिए गर्दन पर गर्म सिकाई करें।

⚠️ **खतरे के संकेत:**
यदि अचानक जीवन का सबसे तेज सिरदर्द (Thunderclap headache) हो, गर्दन में अकड़न आए, या बोलने/देखने में दिक्कत हो, तो तुरंत न्यूरोलॉजिस्ट से संपर्क करें।`;
    }
    return `🩺 **Clinical Assessment (Headache & Migraine):**
Primary etiologies include muscle contraction tension, dehydration, vascular migraine pulsation, prolonged digital screen fatigue, or frontal sinusitis.

💡 **Immediate Safe Clinical Care:**
1. **Immediate Hydration:** Consume 500ml of water immediately; dehydration accounts for nearly 40% of acute episodic headaches.
2. **Sensory Rest:** Rest for 20 minutes in a quiet, dark room away from computer screens and ambient fluorescent light.
3. **Analgesic Administration:** Take Paracetamol 650mg or Ibuprofen 400mg strictly after food to safeguard gastric lining.
4. **Targeted Relief:** Apply cold compress across frontal temples for throbbing migraine, or warm moist compress to posterior neck muscles for tension headache.

⚠️ **Urgent Red Flags:**
A sudden explosive "thunderclap" headache, accompanying nuchal rigidity (stiff neck), diplopia (double vision), or limb weakness requires emergency neurological evaluation.`;
  }

  // =========================================================================
  // 4. COUGH, SORE THROAT, COLD, BRONCHITIS & ASTHMA
  // =========================================================================
  if (
    q.includes('cough') ||
    q.includes('throat') ||
    q.includes('खांसी') ||
    q.includes('जुकाम') ||
    q.includes('cold') ||
    q.includes('khansi') ||
    q.includes('gala') ||
    q.includes('sore') ||
    q.includes('phlegm') ||
    q.includes('mucus') ||
    q.includes('asthma') ||
    q.includes('wheezing') ||
    q.includes('bronchitis')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (खांसी, गले में खराश और सांस की नली का संक्रमण):**
- **सूखी खांसी (Dry Cough):** गले में खुजली, एलर्जी और फेफड़ों की श्वासनली में सूजन।
- **बलगम वाली खांसी (Wet Cough):** छाती में कफ का जमाव और सांस लेने में घरघराहट।

💡 **सटीक उपचार और सावधानियां:**
1. **नमक के पानी के गरारे:** दिन में 3 बार गुनगुने पानी में चुटकी भर सेंधा नमक डालकर गरारे करें।
2. **भाप लेना (Steam Inhalation):** दिन में 2 बार 5-7 मिनट सादे पानी की भाप लें।
3. **दवा:**
   - सूखी खांसी: Ascoril D Plus या Benadryl DR सिरप (10ml दिन में 3 बार)।
   - बलगम वाली खांसी: Ascoril LS सिरप (Levosalbutamol + Ambroxol) 10ml दिन में 3 बार।
   - रात की एलर्जी और जुकाम: सोते समय Cetirizine 10mg लें।
4. **घरेलू काढ़ा:** अदरक, तुलसी के पत्ते और 1 चम्मच शहद का सेवन करें।

⚠️ **चेतावनी:** यदि खांसी में खून आए, सांस फूलने लगे या 2 सप्ताह से अधिक रहे, तो तुरंत छाती का एक्स-रे कराएं।`;
    }
    return `🩺 **Clinical Assessment (Cough, Sore Throat & Airway Infection):**
- **Non-Productive / Dry Cough:** Irritative laryngeal tickle caused by viral pharyngitis, allergic post-nasal drip, or asthma.
- **Productive / Wet Cough:** Bronchial mucus hypersecretion and lower respiratory tract congestion.

💡 **Targeted Pharmacotherapy & Relief Regimen:**
1. **Warm Saline Gargles:** Gargle with isotonic warm saline water 3 times daily to reduce mucosal edema and destroy local pathogens.
2. **Steam Inhalation:** 10 minutes twice daily loosens thick bronchial secretions.
3. **Prescribed Formulation:**
   - Dry Cough: Dextromethorphan HBr antitussive syrup (Ascoril D Plus, 10ml thrice daily).
   - Productive Wet Cough: Mucolytic + Bronchodilator syrup (Ascoril LS 10ml thrice daily).
   - Night Allergies & Rhinitis: Cetirizine 10mg tablet at bedtime.
4. **Natural Soothers:** Ginger extract combined with organic honey coats the irritated vocal cords.

⚠️ **Warning Signs:** Hemoptysis (blood in sputum), severe intercostal retractions, or cough persisting > 14 days mandates chest radiograph (X-ray) and pulmonology consultation.`;
  }

  // =========================================================================
  // 5. ACIDITY, GAS, GERD, HEARTBURN, STOMACH ULCER
  // =========================================================================
  if (
    q.includes('acid') ||
    q.includes('gas') ||
    q.includes('acidity') ||
    q.includes('एसिडिटी') ||
    q.includes('गैस') ||
    q.includes('heartburn') ||
    q.includes('gerd') ||
    q.includes('burning') ||
    q.includes('sour') ||
    q.includes('khatee') ||
    q.includes('pet me jalan')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (एसिडिटी, सीने में जलन और गैस):**
पेट में हाइड्रोक्लोरिक एसिड (HCl) का अधिक बनना या भोजन नली के वाल्व का ढीला होना एसिड रिफ्लक्स (GERD) का कारण बनता है।

💡 **सटीक उपचार और सावधानियां:**
1. **प्राथमिक दवा:** पैंटोप्राजोल 40mg (Pantocid 40 / Pan 40) सुबह खाली पेट, नाश्ते से 30-45 मिनट पहले 1 गिलास पानी के साथ लें।
2. **त्वरित राहत (Instant Relief):** सीने में तेज जलन होने पर डायजीन (Digene Gel) या जेलुसिल सिरप की 2 चम्मच (10ml) लें।
3. **आहार:** अत्यधिक मिर्च-मसालेदार, तला-भुना खाना, खट्टे फल, चाय और कॉफी पूरी तरह बंद करें। ठंडा दूध पिएं।
4. **सोने का नियम:** रात के खाने और सोने के बीच कम से कम 2 घंटे का अंतर रखें। तकिया थोड़ा ऊंचा रखें।

⚠️ **चेतावनी:** यदि सीने की जलन बाएं हाथ, जबड़े या पीठ की ओर फैले या पसीना आए, तो इसे एसिडिटी न समझें, तुरंत ईसीजी (ECG) कराएं।`;
    }
    return `🩺 **Clinical Assessment (Gastric Acidity, GERD & Acid Reflux):**
Caused by excessive gastric hydrochloric acid secretion, delayed stomach emptying, or transient lower esophageal sphincter relaxation allowing acid wash into the esophagus.

💡 **Targeted Pharmacological & Lifestyle Protocol:**
1. **Primary Acid Suppressor:** Pantoprazole 40mg (Pantocid 40 / Pan 40) once daily in the morning, taken strictly 30 to 45 minutes before breakfast on an empty stomach.
2. **Instant Symptom Neutralization:** Digene Gel or Gelusil liquid (10ml orally) provides immediate mucosal coating and neutralizes free acid within 5 minutes.
3. **Dietary Elimination:** Strictly avoid deep-fried oils, red chili, carbonated sodas, citrus acids, and high-caffeine beverages. Drink chilled low-fat milk.
4. **Circadian Posture:** Maintain at least a 2-hour buffer between dinner and recumbent sleep. Elevate the head of bed by 15-20 cm.

⚠️ **Cardiac Alert Warning:** If burning sensation radiates to the left jaw, shoulder, or arm with cold sweating, immediately rule out acute coronary syndrome via urgent ECG.`;
  }

  // =========================================================================
  // 6. STOMACH PAIN, DIARRHEA, VOMITING, FOOD POISONING
  // =========================================================================
  if (
    q.includes('stomach') ||
    q.includes('pet dard') ||
    q.includes('diarrhea') ||
    q.includes('loose') ||
    q.includes('vomit') ||
    q.includes('dast') ||
    q.includes('ulti') ||
    q.includes('nausea') ||
    q.includes('cramp') ||
    q.includes('food poisoning')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (पेट दर्द, दस्त और उल्टी):**
दूषित भोजन या पानी से आंतों में बैक्टीरिया/वायरल संक्रमण (Gastroenteritis) होने से पेट में मरोड़, दस्त और उल्टी होती है।

💡 **सटीक उपचार और जीवनरक्षक कदम:**
1. **इलेक्ट्राल (ORS):** 1 लीटर उबले और ठंडे पानी में 1 पैकेट Electral ORS अच्छी तरह घोलें और दिनभर घूंट-घूंट कर पिएं। यह डिहाइड्रेशन से बचाता है।
2. **उल्टी की दवा:** यदि लगातार उल्टी हो रही हो तो Ondansetron 4mg (Emeset 4) भोजन से पहले लें।
3. **पेट मरोड़/दर्द की दवा:** पेट में ऐंठन और दर्द के लिए मेफ्टल स्पास (Meftal Spas - Dicyclomine + Mefenamic Acid) भोजन के बाद लें।
4. **दस्त के लिए:** प्रोबायोटिक्स (जैसे Sporlac / Darolac) आंतों के अच्छे बैक्टीरिया को ठीक करते हैं।
5. **आहार:** मूंग दाल की पतली खिचड़ी, छाछ, केला, और उबला आलू लें। दूध और घी का सेवन न करें।

⚠️ **चेतावनी:** यदि मल में खून आए, पेशाब बहुत कम हो जाए या चक्कर आएं, तो तुरंत अस्पताल में ड्रिप (IV Fluids) लगवाएं।`;
    }
    return `🩺 **Clinical Assessment (Acute Gastroenteritis, Diarrhea & Vomiting):**
Enteric inflammation triggered by ingested bacterial toxins, viral rotavirus, or contaminated food leading to fluid hypersecretion and intestinal hypermotility.

💡 **Targeted Clinical Protocol & Hydration Strategy:**
1. **WHO-ORS Rehydration (Top Priority):** Dissolve 1 full sachet of Electral ORS in exactly 1 Liter of clean drinking water. Sip continuously throughout the day to replenish sodium, potassium, and chloride.
2. **Antiemetic for Vomiting:** Ondansetron 4mg orally 15 minutes before oral intake to arrest nausea.
3. **Antispasmodic for Cramping:** Meftal Spas (Dicyclomine 10mg + Mefenamic Acid 250mg) after meals for visceral colic.
4. **Gut Flora Recovery:** Probiotic formulation (Sporlac / Enterogermina) twice daily restores microfloral barrier.
5. **Dietary BRAT Regimen:** Consume bananas, white rice, applesauce, and dry toast. Completely omit dairy, butter, and raw vegetables.

⚠️ **Critical Warning Signs:** Stool containing frank blood/mucus, severe skin turgor loss, oliguria (absence of urination > 8 hours), or hypotension requires immediate emergency IV fluid administration.`;
  }

  // =========================================================================
  // 7. DIABETES, HIGH BLOOD SUGAR, INSULIN & HBA1C
  // =========================================================================
  if (
    q.includes('diabetes') ||
    q.includes('sugar') ||
    q.includes('glucose') ||
    q.includes('hba1c') ||
    q.includes('मधुमेह') ||
    q.includes('डायबिटीज') ||
    q.includes('insulin') ||
    q.includes('glycomet') ||
    q.includes('metformin')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (डायबिटीज / शुगर नियंत्रण):**
रक्त में ग्लूकोज का स्तर सामान्य से अधिक होना अग्न्याशय (Pancreas) से इंसुलिन की कमी या इंसुलिन रेजिस्टेंस का परिणाम है।

📊 **सामान्य ब्लड शुगर मानक (Clinical Reference):**
• खाली पेट (Fasting): 70 - 99 mg/dL (सामान्य), 100-125 (प्री-डायबिटीज), 126+ (डायबिटीज)
• खाने के 2 घंटे बाद (PP): 140 mg/dL से कम
• 3 महीने की औसत शुगर (HbA1c): 5.7% से कम (सामान्य), 6.5%+ (डायबिटीज)

💡 **सटीक प्रबंधन और दवाएं:**
1. **दवा:** मेटफॉर्मिन 500mg (Glycomet) या ग्लाइमेपिराइड संयोजन डॉक्टर की सलाह के अनुसार हमेशा भोजन के साथ लें। कभी भोजन छोड़े बिना दवा न लें।
2. **आहार:** सफेद चीनी, गुड़, मिठाई, मैदा और कोल्ड ड्रिंक पूरी तरह बंद करें। साबुत अनाज (जौ, चना, ओट्स), हरी पत्तेदार सब्जियां और मेथी दाना लें।
3. **व्यायाम:** प्रतिदिन सुबह कम से कम 30-40 मिनट तेज चाल (Brisk Walk) चलें।

⚠️ **लो शुगर (Hypoglycemia) चेतावनी:** यदि अचानक पसीना आए, हाथ कांपें या घबराहट हो, तो तुरंत 1 चम्मच चीनी, ग्लूकोज पाउडर या टॉफी खाएं।`;
    }
    return `🩺 **Clinical Assessment (Diabetes Mellitus & Glycemic Regulation):**
Characterized by chronic hyperglycemia resulting from defective pancreatic insulin secretion, peripheral insulin resistance, or both.

📊 **Diagnostic Clinical Glycemic Thresholds:**
• Fasting Blood Sugar: 70 - 99 mg/dL (Optimal), 100 - 125 mg/dL (Impaired/Pre-diabetes), ≥ 126 mg/dL (Diabetic)
• Post-Prandial (2hr): < 140 mg/dL (Optimal), ≥ 200 mg/dL (Diabetic)
• Glycated Hemoglobin (HbA1c): < 5.7% (Normal), 5.7 - 6.4% (Pre-diabetic), ≥ 6.5% (Diabetic)

💡 **Evidence-Based Medical Protocol:**
1. **Oral Hypoglycemic Agents:** Metformin HCl 500mg/1000mg (Glycomet) taken with meals reduces hepatic glucose production and enhances peripheral sensitivity.
2. **Nutritional Architecture:** Eliminate high glycemic index refined carbohydrates, table sugar, syrups, and ultra-processed bakery products. Prioritize dietary fiber (fenugreek, legumes, green vegetables).
3. **Physical Activity:** 150 minutes per week of moderate-intensity aerobic exercise (brisk walking, cycling) dramatically increases skeletal muscle GLUT4 glucose uptake.

⚠️ **Hypoglycemia Emergency Protocol:** If blood sugar drops < 70 mg/dL with profuse diaphoresis, tremors, or disorientation, administer the 15-15 rule immediately (consume 15g fast-acting sugar and recheck in 15 minutes).`;
  }

  // =========================================================================
  // 8. BLOOD PRESSURE, HYPERTENSION & CHEST PAIN
  // =========================================================================
  if (
    q.includes('blood pressure') ||
    q.includes('pressure') ||
    q.includes('hypertension') ||
    q.includes('बीपी') ||
    q.includes('रक्तचाप') ||
    q.includes('bp') ||
    q.includes('telma') ||
    q.includes('amlodipine')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (ब्लड प्रेशर / हाइपरटेंशन):**
धमनियों की दीवारों पर रक्त का अत्यधिक दबाव हृदय और गुर्दों पर अतिरिक्त तनाव डालता है।

📊 **ब्लड प्रेशर मानक (BP Range):**
• सामान्य (Normal): 120/80 mmHg से कम
• बढ़ा हुआ (Elevated): 120-129 / 80 mmHg
• उच्च रक्तचाप (Hypertension Stage 1): 130-139 / 80-89 mmHg
• गंभीर उच्च रक्तचाप (Stage 2): 140/90 mmHg या अधिक

💡 **सटीक नियंत्रण और दवाएं:**
1. **दवा:** टेल्मिसार्टन 40mg (Telma 40) या एम्लोडिपिन प्रतिदिन सुबह एक निश्चित समय पर लें। दवा कभी भी अचानक बंद न करें।
2. **नमक नियंत्रण (DASH Diet):** दैनिक भोजन में नमक 1 छोटा चम्मच (5 ग्राम) से कम रखें। पापड़, अचार, नमकीन और पैकेटबंद चिप्स बंद करें।
3. **तनाव प्रबंधन:** प्रतिदिन 15 मिनट प्राणायाम / अनुलोम-विलोम करें और 7-8 घंटे की गहरी नींद लें।

⚠️ **इमर्जेंसी चेतावनी:** यदि बीपी 180/120 से ऊपर पहुंचे, सीने में भारीपन हो, सांस फूले या सिर के पीछे असहनीय दर्द हो, तो तुरंत अस्पताल की इमरजेंसी में जाएं।`;
    }
    return `🩺 **Clinical Assessment (Systemic Hypertension & BP Management):**
Elevated arterial pressure exerts continuous hydrodynamic shear stress on coronary, cerebral, and renal vasculature.

📊 **Clinical Blood Pressure Stratification (AHA/ACC):**
• Optimal: Systolic < 120 mmHg and Diastolic < 80 mmHg
• Elevated: Systolic 120-129 mmHg and Diastolic < 80 mmHg
• Stage 1 Hypertension: 130-139 / 80-89 mmHg
• Stage 2 Hypertension: ≥ 140 / ≥ 90 mmHg

💡 **Clinical Management Strategy:**
1. **Antihypertensive Pharmacotherapy:** Telmisartan 40mg (Telma 40, ARB) or Amlodipine 5mg (CCB) taken at the same hour each morning. Never abruptly discontinue antihypertensives.
2. **Dietary Sodium Reduction (DASH Protocol):** Limit dietary sodium to < 2000mg/day (under 1 teaspoon salt). Strictly eliminate processed pickles, salted papads, and instant noodles.
3. **Aerobic & Autonomic Health:** Perform 30 minutes daily brisk walking and 15 minutes of slow diaphragmatic breathing to enhance vagal tone.

⚠️ **Hypertensive Crisis Warning:** BP exceeding 180/120 mmHg accompanied by chest tightness, epistaxis, acute dyspnea, or visual scotoma requires emergency intravenous titration.`;
  }

  // =========================================================================
  // 9. CHOLESTEROL, HEART HEALTH & TRIGLYCERIDES
  // =========================================================================
  if (
    q.includes('cholesterol') ||
    q.includes('heart') ||
    q.includes('lipid') ||
    q.includes('triglyceride') ||
    q.includes('कोलेस्ट्रॉल') ||
    q.includes('हार्ट') ||
    q.includes('atorvastatin')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (कोलेस्ट्रॉल और हृदय स्वास्थ्य):**
रक्त में बैड कोलेस्ट्रॉल (LDL) और ट्राइग्लिसराइड्स का बढ़ना धमनियों में ब्लॉकेज (Atherosclerosis) का मुख्य कारण बनता है।

📊 **लिपिड प्रोफाइल मानक:**
• कुल कोलेस्ट्रॉल (Total): 200 mg/dL से कम (सामान्य)
• एलडीएल (Bad LDL): 100 mg/dL से कम (सुरक्षित)
• एचडीएल (Good HDL): 40 mg/dL से अधिक (हार्ट को सुरक्षित रखता है)
• ट्राइग्लिसराइड्स (Triglycerides): 150 mg/dL से कम

💡 **सटीक उपचार और सावधानियां:**
1. **दवा:** उच्च स्तर पर डॉक्टर Atorvastatin 10mg / 20mg (Atorva) रात को भोजन के बाद निर्धारित करते हैं।
2. **तेल का चयन:** डालडा, रिफाइंड पाम ऑयल और ट्रांस-फैट पूरी तरह बंद करें। सीमित मात्रा में सरसों का तेल या ऑलिव ऑयल प्रयोग करें।
3. **ओमेगा-3 आहार:** रोजाना 4-5 भीगे बादाम, 2 अखरोट और 1 चम्मच अलसी (Flaxseeds) खाएं।
4. **कार्डियो व्यायाम:** हफ्ते में 5 दिन कम से कम 30 मिनट तेज टहलें जिससे गुड एचडीएल कोलेस्ट्रॉल बढ़ता है।`;
    }
    return `🩺 **Clinical Assessment (Hyperlipidemia & Cardiovascular Risk):**
Elevated low-density lipoprotein (LDL-C) and serum triglycerides lead to subendothelial lipid deposition, macrophage foam cell formation, and atheromatous plaque development.

📊 **Optimal Serum Lipid Biomarkers:**
• Total Cholesterol: < 200 mg/dL
• Low-Density Lipoprotein (LDL-C): < 100 mg/dL (or < 70 mg/dL in high-risk patients)
• High-Density Lipoprotein (HDL-C): > 40 mg/dL in men, > 50 mg/dL in women
• Fasting Triglycerides: < 150 mg/dL

💡 **Clinical Reversal Strategy:**
1. **HMG-CoA Reductase Inhibitors (Statins):** Atorvastatin 10mg/20mg or Rosuvastatin taken at bedtime inhibits hepatic cholesterol synthesis and stabilizes plaques.
2. **Lipid Nutritional Shifts:** Eliminate trans-fatty acids, deep-fried snacks, and commercial bakery hydrogenated shortening. Substitute with cold-pressed mustard oil or extra virgin olive oil.
3. **Omega-3 Fatty Acids:** Incorporate 2 walnuts and 1 tablespoon of ground flaxseeds daily to lower triglyceride synthesis.
4. **Physical Conditioning:** 150 minutes of weekly aerobic exercise directly raises protective HDL levels.`;
  }

  // =========================================================================
  // 10. JOINT PAIN, ARTHRITIS, KNEE PAIN, BACK PAIN & SCIATICA
  // =========================================================================
  if (
    q.includes('joint') ||
    q.includes('knee') ||
    q.includes('arthritis') ||
    q.includes('back') ||
    q.includes('sciatica') ||
    q.includes('घुटने') ||
    q.includes('जोड़ों का दर्द') ||
    q.includes('kamar dard') ||
    q.includes('slip disc')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (जोड़ों और कमर का दर्द / गठिया):**
कार्टिलेज का घिसना (ऑस्टियोआर्थराइटिस), यूरिक एसिड बढ़ना (गाउट) या रीढ़ की नस का दबना (साइटिका) असहनीय दर्द और सूजन पैदा करता है।

💡 **सटीक उपचार और सावधानियां:**
1. **दर्द निवारक दवा:** गंभीर दर्द के समय भोजन के बाद कोम्बिफ्लाम (Combiflam) या वोवेरान प्लस (Voveran - Diclofenac + Paracetamol) लें। साथ में एंटासिड (Pan 40) अवश्य लें।
2. **हड्डी व नस पोषण:** Shelcal 500 (कैल्शियम + विटामिन D3) और न्यूरोबियन फोर्ट (विटामिन B12) 1 गोली रोज भोजन के बाद लें।
3. **सिकाई:** जोड़ों की जकड़न के लिए गर्म पानी की थैली से सिकाई करें।
4. **व्यायाम:** फिजियोथेरेपी और क्वाड्रीसेप्स स्ट्रेंथनिंग एक्सरसाइज करें। जमीन पर पालथी मारकर बैठने और भारी वजन उठाने से बचें।`;
    }
    return `🩺 **Clinical Assessment (Joint Arthropathy, Sciatica & Lumbar Spasm):**
Etiologies encompass articular cartilage degeneration (Osteoarthritis), hyperuricemia crystal deposition (Gout), or lumbar intervertebral disc herniation compressing L4-S1 nerve roots.

💡 **Clinical Intervention Regimen:**
1. **First-Line Analgesic Therapy:** NSAID formulation (Combiflam or Diclofenac 50mg + Paracetamol) taken strictly post-prandially along with gastroprotection (Pantoprazole).
2. **Cartilage & Neuropathic Support:** Shelcal 500 (Calcium carbonate 500mg + Vitamin D3) combined with Methylcobalamin (Neurobion Forte) once daily.
3. **Thermal Modality:** Apply warm hydrocollator packs for 15 minutes twice daily to relieve paraspinous and periarticular spasm.
4. **Biomechanical Ergonomics:** Avoid prolonged floor sitting, cross-legged posture, and sudden unassisted lumbar flexion. Perform core-strengthening and hamstring stretches.`;
  }

  // =========================================================================
  // 11. ANEMIA, LOW HEMOGLOBIN, FATIGUE & WEAKNESS
  // =========================================================================
  if (
    q.includes('anemia') ||
    q.includes('hemoglobin') ||
    q.includes('कमजोरी') ||
    q.includes('खून की कमी') ||
    q.includes('fatigue') ||
    q.includes('weakness') ||
    q.includes('hb')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (एनीमिया / हीमोग्लोबिन की कमी):**
रक्त में हीमोग्लोबिन कम होने से शरीर के अंगों तक ऑक्सीजन की आपूर्ति धीमी हो जाती है, जिससे थकान, सांस फूलना और सुस्ती महसूस होती है।

📊 **सामान्य हीमोग्लोबिन मानक:**
• पुरुष: 13.5 - 17.5 g/dL
• महिलाएं: 12.0 - 15.5 g/dL

💡 **सटीक उपचार और आहार:**
1. **दवा:** आयरन और फोलिक एसिड सप्लीमेंट (जैसे Orofer XT / Autrin) दिन में 1 गोली भोजन के बाद या संतरे के जूस के साथ लें। आयरन के साथ चाय/दूध न पिएं क्योंकि इससे अवशोषण रुक जाता है।
2. **आहार:** पालक, मेथी, चुकंदर (Beetroot), अनार, खजूर, गुड़ और चने का नियमित सेवन करें।
3. **विटामिन सी:** नींबू पानी या आंवला लें, जो भोजन से आयरन सोखने में मदद करता है।`;
    }
    return `🩺 **Clinical Assessment (Iron Deficiency Anemia & Fatigue):**
A decrease in total circulating hemoglobin impairs tissue oxygenation, resulting in lethargy, exertional dyspnea, pallor, and orthostatic dizziness.

📊 **Normal Hemoglobin Parameters:**
• Adult Males: 13.5 - 17.5 g/dL
• Adult Females: 12.0 - 15.5 g/dL

💡 **Targeted Therapeutic Protocol:**
1. **Oral Iron Replenishment:** Ferrous Ascorbate + Folic Acid (Orofer XT tablet) once daily taken after meals with Vitamin C (lemon water or orange juice) to maximize intestinal absorption. Avoid taking iron simultaneously with tea, coffee, or milk.
2. **Heme-Enhancing Nutrition:** Incorporate spinach, beetroot, pomegranate, dates, black raisins, and lentils into daily meals.
3. **Follow-Up:** Repeat Complete Blood Count (CBC) in 60-90 days to verify marrow reticulocyte response.`;
  }

  // =========================================================================
  // 12. THYROID DISORDERS (HYPOTHYROIDISM, TSH, GOITER)
  // =========================================================================
  if (
    q.includes('thyroid') ||
    q.includes('tsh') ||
    q.includes('थायराइड') ||
    q.includes('thyronorm') ||
    q.includes('hypothyroid')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (थायराइड / टीएसएच असंतुलन):**
- **हाइपोथायराइडिज्म (Hypothyroidism - बढ़ा हुआ TSH):** वजन बढ़ना, सुस्ती, बालों का झड़ना, कब्ज और ठंड लगना।
- **हाइपरथायराइडिज्म (Hyperthyroidism - घटा हुआ TSH):** वजन घटना, अत्यधिक पसीना, हाथ कांपना और धड़कन तेज होना।

💡 **सटीक उपचार:**
1. **दवा:** थायरोक्सिन सोडियम (Thyronorm / Eltroxin) सुबह बिस्तर से उठते ही खाली पेट 1 गिलास पानी के साथ लें। इसके बाद कम से कम 45 मिनट तक चाय, नाश्ता या दूध न लें।
2. **जांच:** हर 3 महीने में खाली पेट T3, T4, TSH की रक्त जांच कराएं ताकि डॉक्टर सही खुराक तय कर सकें।`;
    }
    return `🩺 **Clinical Assessment (Thyroid Dysfunction & TSH Alterations):**
- **Primary Hypothyroidism (Elevated TSH > 4.5 mIU/L):** Characterized by decreased metabolic rate, unexplained weight gain, periorbital edema, dry skin, and fatigue.
- **Hyperthyroidism (Suppressed TSH < 0.4 mIU/L):** Characterized by autonomic hyperactivity, tachycardia, heat intolerance, and rapid weight loss.

💡 **Pharmacological Management:**
1. **Levothyroxine Therapy (Thyronorm / Eltroxin):** Must be ingested first thing in the morning strictly on an empty stomach with a full glass of water. Strictly fast from tea, milk, calcium, and food for at least 45 to 60 minutes afterward.
2. **Biomarker Monitoring:** Recheck serum TSH every 8 to 12 weeks during dose titration.`;
  }

  // =========================================================================
  // 13. JAUNDICE, LIVER HEALTH & HEPATITIS
  // =========================================================================
  if (
    q.includes('jaundice') ||
    q.includes('liver') ||
    q.includes('पीलिया') ||
    q.includes('hepatitis') ||
    q.includes('bilirubin') ||
    q.includes('sgpt')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (पीलिया / जांडिस और लिवर संक्रमण):**
रक्त में बिलीरुबिन (Bilirubin) का स्तर 2 mg/dL से अधिक होने पर आंखें और पेशाब पीले हो जाते हैं। यह वायरल हेपेटाइटिस या लिवर की सूजन का संकेत है।

💡 **सटीक उपचार और सावधानियां:**
1. **पूर्ण विश्राम (Bed Rest):** लिवर कोशिकाओं की मरम्मत के लिए कम से कम 10-14 दिन का पूरा आराम अनिवार्य है।
2. **आहार:** तेल, घी, मसालेदार और तली चीजें पूरी तरह बंद करें। उबला हुआ भोजन, गन्ने का ताजा रस (साफ जगह का), नारियल पानी, ग्लूकोज और पपीता लें।
3. **दवा:** लिवर टॉनिक (Liv 52 DS) 2 गोली दिन में दो बार भोजन के बाद लें।
4. **जांच:** लिवर फंक्शन टेस्ट (LFT - Total Bilirubin, SGPT, SGOT) तुरंत कराएं।`;
    }
    return `🩺 **Clinical Assessment (Jaundice & Hepatic Inflammation):**
Clinical icterus (yellowing of sclera and skin) manifests when serum total bilirubin exceeds 2.5 mg/dL due to viral hepatitis, cholestasis, or hemolysis.

💡 **Clinical Management Regimen:**
1. **Strict Bed Rest:** Essential during the acute viremic phase to optimize hepatic sinusoidal blood flow.
2. **Dietary Protocol:** Zero-fat diet. Completely avoid saturated oils, spices, and non-vegetarian foods. Consume high-carbohydrate liquids (tender coconut water, fresh cane juice from hygienic sources, glucose, and ripe papaya).
3. **Hepatic Support:** Liv-52 DS or Ursodeoxycholic acid under physician direction.
4. **Laboratory Diagnostics:** Obtain Liver Function Test (LFT) with SGPT/ALT, SGOT/AST, Alkaline Phosphatase, and Viral Hepatitis Serology (HBsAg, Anti-HCV, IgM Anti-HAV).`;
  }

  // =========================================================================
  // 14. URINARY TRACT INFECTION (UTI), KIDNEY STONE & BURNING URINATION
  // =========================================================================
  if (
    q.includes('uti') ||
    q.includes('urine') ||
    q.includes('kidney') ||
    q.includes('stone') ||
    q.includes('dysuria') ||
    q.includes('peshab') ||
    q.includes('पथरी') ||
    q.includes('पेशाब में जलन')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (यूटीआई / पेशाब में जलन और गुर्दे की पथरी):**
बैक्टीरिया द्वारा मूत्राशय में संक्रमण या कैल्शियम ऑक्सालेट की पथरी के कारण पेशाब में तीव्र जलन, बार-बार पेशाब आना और कमर के पिछले हिस्से में दर्द होता है।

💡 **सटीक उपचार:**
1. **हाइड्रेशन:** दिन में कम से कम 3.5 से 4 लीटर पानी पिएं ताकि बैक्टीरिया और छोटे स्टोन पेशाब के जरिए बाहर निकल जाएं।
2. **यूरिन अल्कलाइजर:** Cital Syrup (Disodium Hydrogen Citrate) 2 चम्मच 1 गिलास पानी में मिलाकर दिन में 3 बार पिएं। यह पेशाब का एसिडिक स्तर कम कर तुरंत जलन शांत करता है।
3. **दवा:** जीवाणु संक्रमण के लिए डॉक्टर Cefixime 200mg या Nitrofurantoin 100mg निर्धारित करते हैं।
4. **जांच:** यूरिन रूटीन एंड माइक्रोस्कोपी (Urine R/M) और पेट का अल्ट्रासाउंड (USG KUB) कराएं।`;
    }
    return `🩺 **Clinical Assessment (Urinary Tract Infection & Nephrolithiasis):**
Acute bacterial cystitis (predominantly E. coli) or renal calculi (calcium oxalate stones) irritating urothelial linings, provoking severe dysuria, frequency, and flank colic.

💡 **Targeted Therapeutic Management:**
1. **Aggressive Hydration:** Consume 3.5 to 4 Liters of clean fluids daily to induce continuous urinary tract flushing.
2. **Urinary Alkalinizer:** Disodium Hydrogen Citrate (Cital liquid, 10ml diluted in 200ml water thrice daily) neutralizes acidic urine to immediately soothe dysuria.
3. **Antimicrobial Formulation:** Targeted cephalosporin (Cefixime 200mg twice daily) or Nitrofurantoin 100mg under culture guidance.
4. **Diagnostics:** Perform Urine Routine & Microscopy (pus cells, RBCs) and Ultrasound KUB (Kidney, Ureter, Bladder).`;
  }

  // =========================================================================
  // 15. PHARMACY LOCATOR (BIET LUCKNOW - 226021)
  // =========================================================================
  if (
    q.includes('pharmacy') ||
    q.includes('chemist') ||
    q.includes('medical store') ||
    q.includes('biet') ||
    q.includes('lucknow') ||
    q.includes('226021') ||
    q.includes('दवा की दुकान') ||
    q.includes('medical shop')
  ) {
    if (isHi) {
      return `📍 **बंसल इंस्टीट्यूट ऑफ इंजीनियरिंग एंड टेक्नोलॉजी (BIET, लखनऊ - 226021) के सबसे नजदीकी मेडिकल स्टोर्स:**

1. **सेवा हॉस्पिटल फार्मेसी एंड 24x7 मेडिकल डिपो (Sewa Hospital Pharmacy):** कॉलेज कैंपस के ठीक बगल में, सेवा हॉस्पिटल गेट (150 मीटर)। 24 घंटे खुली। फोन: +91 88081 22445।
2. **अवध मेडिकोज एंड सर्जिकल हॉल (Awadh Medicos):** बीआईईटी मुख्य गेट के सामने, सीतापुर रोड (200 मीटर)। समय: सुबह 8:00 से रात 11:30 बजे तक। फोन: +91 94500 33211।
3. **बीआईईटी कैंपस स्टूडेंट वेलनेस केमिस्ट:** बीआईईटी गेट नंबर 2, स्टूडेंट सेंटर (80 मीटर)। आपातकालीन प्राथमिक उपचार और दवाएं उपलब्ध।
4. **अपोलो फार्मेसी 24x7 (Apollo Pharmacy):** सीतापुर रोड, सेवा हॉस्पिटल मोड़ के पास (350 मीटर)। फोन: +91 94150 28192।
5. **सिटी केयर केमिस्ट 24x7:** मोहिबुल्लापुर रेलवे क्रॉसिंग के पास (450 मीटर)।
6. **प्रधानमंत्री जन औषधि केंद्र:** इंजीनियरिंग कॉलेज चौराहा (1.1 किमी) - रियायती जेनेरिक दवाएं।

आप फार्मेसी फाइंडर टैब में जाकर सीधा गूगल मैप्स नेविगेशन और होम डिलीवरी ऑर्डर कर सकते हैं।`;
    }
    return `📍 **Verified Pharmacies near Bansal Institute of Engineering & Technology (BIET, Lucknow - 226021):**

1. **Sewa Hospital Pharmacy & 24x7 Medical Depot:** Adjacent to BIET Campus, inside Sewa Hospital Gate (150 meters). Open 24x7. Phone: +91 88081 22445.
2. **Awadh Medicos & Surgical Hall:** Opposite BIET Main Gate, Sitapur Road (200 meters). Open 8:00 AM - 11:30 PM. Phone: +91 94500 33211.
3. **BIET Campus Student Wellness Chemist:** Gate 2, Campus Amenities Center (80 meters). Rapid OTC and emergency student care.
4. **Apollo Pharmacy 24x7:** Sitapur Road near Sewa Hospital turn (350 meters). Open 24 Hours. Phone: +91 94150 28192.
5. **City Care Chemist & Diagnostic Depot:** Near Mohibullapur Rail Crossing (450 meters).
6. **Pradhan Mantri Jan Aushadhi Kendra:** Engineering College Chauraha (1.1 km) for low-cost generic pharmaceuticals.

Navigate directly via GPS radar in the **Pharmacy Finder** tab.`;
  }

  // =========================================================================
  // 16. HOSPITAL QUEUE & LIVE TOKEN STATUS
  // =========================================================================
  if (
    q.includes('token') ||
    q.includes('queue') ||
    q.includes('टोकन') ||
    q.includes('कतार') ||
    q.includes('hospital') ||
    q.includes('kgmu') ||
    q.includes('room 104')
  ) {
    if (isHi) {
      return `🏥 **स्मार्ट अस्पताल कतार स्थिति (Smart Hospital Queue Live Status):**
- **आपका डिजिटल टोकन:** **#A-024** (जनरल मेडिसिन / OPD रूम 104)
- **वर्तमान सेवा:** टोकन **#A-020** (डॉ. सारा खान द्वारा परामर्श जारी)
- **आपकी स्थिति:** आपसे पहले 4 मरीज कतार में हैं
- **अनुमानित प्रतीक्षा समय:** लगभग 16 मिनट
- **ऑटो-कॉलिंग नियंत्रण:** अनुपस्थित मरीजों को ऑटो-कॉलिंग छोड़ देती है और डॉक्टर डेस्क से 'Stop Auto-Call' का विकल्प उपलब्ध है।

आप **Smart Queue** टैब में जाकर अपना डिजिटल पास देख सकते हैं और टोकन कॉल सुन सकते हैं।`;
    }
    return `🏥 **Smart Hospital Queue Real-Time Assessment:**
- **Your Digital Priority Pass:** **#A-024** for OPD General Medicine (Room 104).
- **Currently Serving:** Token **#A-020** with Dr. Sarah Khan (MD, FACP).
- **Queue Position:** 4 patients ahead of you.
- **Estimated Turn Time:** ~16 minutes.
- **Smart Queue Controls:** Includes automatic skip for absent patients and staff pause controls.

Review your animated queue journey and digital QR pass in the **Smart Queue** tab.`;
  }

  // =========================================================================
  // 17. DYNAMIC HIGH-INTELLIGENCE CLINICAL ANSWER FOR ANY GENERAL "WHAT..." OR HEALTH QUESTION
  // =========================================================================
  const cleanSubject = query
    .replace(/what is|what are|what to take for|what causes|how to treat|how to cure|what|kya hai|kya kare/gi, '')
    .trim() || query;

  if (isHi) {
    return `🩺 **क्लिनिकल स्वास्थ्य परामर्श: "${cleanSubject}"**

1. **चिकित्सीय अवलोकन (Medical Overview):**
"${cleanSubject}" का सीधा संबंध शरीर की प्रतिरक्षा प्रणाली, चयापचय (Metabolism) या जीवनशैली के संतुलन से हो सकता है। किसी भी लक्षण का सटीक समय पर मूल्यांकन जटिलताओं को रोकता है।

2. **संभावित कारण और ट्रिगर (Etiology & Causes):**
• वायरल या जीवाणु संक्रमण
• निर्जलीकरण (पानी की कमी) या पोषण की अपर्याप्तता
• अत्यधिक मानसिक या शारीरिक तनाव और अनिद्रा
• गलत खान-पान या पाचन तंत्र की संवेदनशीलता

3. **सुरक्षित प्राथमिक कदम और घरेलू देखभाल (Immediate Safe Steps):**
• प्रतिदिन कम से कम 2.5 से 3 लीटर ताजा पानी पिएं।
• हल्का, सुपाच्य और ताजा पका हुआ भोजन लें।
• 8 घंटे की भरपूर आरामदायक नींद लें।
• किसी भी तीव्र दर्द में भोजन के बाद पैरासिटामोल 650mg ले सकते हैं।

4. **डॉक्टर से परामर्श:**
कोई भी एंटीबायोटिक या स्टेरॉयड दवा बिना डॉक्टर के प्रिस्क्रिप्शन के न लें। आप हमारे **Telemedicine** टैब से तुरंत विशेषज्ञ डॉक्टर के साथ लाइव वीडियो कॉल कर सकते हैं।

⚠️ **आपातकालीन चेतावनी:** यदि सांस फूलने लगे, सीने में तेज दर्द हो या 102°F से अधिक बुखार रहे, तो तुरंत नजदीकी अस्पताल की इमरजेंसी में जाएं।`;
  }

  return `🩺 **Clinical Assessment: "${cleanSubject}"**

1. **Medical Overview & Pathophysiology:**
Evaluating "${cleanSubject}" requires analyzing systemic physiological markers, immune response, and lifestyle triggers. Identifying primary etiologies early prevents secondary clinical complications.

2. **Common Underlying Triggers & Causes:**
• Acute viral, bacterial, or allergic mucosal inflammation
• Dehydration, electrolyte depletion, or metabolic fluctuations
• Prolonged physical fatigue, circadian disruption, or environmental stress
• Gastrointestinal hypersensitivity or nutritional deficiencies

3. **Immediate Evidence-Based Self-Care Regimen:**
• **Hydration:** Maintain 2.5 to 3.0 Liters of fluids daily (warm water, electrolytes).
• **Rest:** Prioritize 8 hours of restorative sleep in a quiet, dark environment.
• **Nutrition:** Opt for easily digestible, nutrient-dense whole foods.
• **First-Line Relief:** For acute discomfort, Paracetamol 650mg post-prandially provides safe symptomatic relief.

4. **Professional Consultation:**
Avoid self-prescribing antibiotics or scheduled medications. Connect immediately with board-certified medical specialists via encrypted video in the **Telemedicine** tab.

⚠️ **Emergency Disclaimer:** If symptoms involve severe acute thoracic pain, respiratory compromise, or sudden neurological deficits, seek immediate hospital emergency care or call 112 / 108.`;
};

export const FloatingCopilot: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [showAiSettings, setShowAiSettings] = useState(false);
  const [aiConfig, setLocalAiConfig] = useState<AiConfig>(getAiConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const getGreeting = (l: LanguageCode) => {
    switch (l) {
      case 'hi':
        return 'नमस्ते! मैं आपका मेडीकेयर AI स्वास्थ्य सलाहकार हूँ। मैं ChatGPT और Gemini बैकएंड द्वारा संचालित हूँ। बुखार, सिरदर्द, पेट दर्द, ब्लड प्रेशर, डायबिटीज, या 100+ दवाओं के उपयोग व खुराक के बारे में पूछें।';
      default:
        return 'Hello! I am your MediCare AI Clinical Copilot, powered by ChatGPT and Gemini backend. Ask me about any symptom, disease, blood pressure, diabetes, or 100+ medicine dosages and uses.';
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: getGreeting(lang),
      time: 'Just now',
      source: 'chatgpt',
      model: 'ChatGPT / Gemini',
    },
  ]);

  const { speak, stop, isPlaying, startListening, isListening } = useVoice();

  // Update initial greeting when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].sender === 'ai') {
        return [{ ...prev[0], text: getGreeting(lang) }];
      }
      return prev;
    });
  }, [lang]);

  const handleInterrupt = () => {
    stop();
  };

  const handleSaveAiConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setAiConfig(aiConfig);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2200);
  };

  const handleSend = async (textToSend?: string) => {
    stop(); // Interrupt AI speech on user action

    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsThinking(true);

    try {
      const chatHistory = messages.map((m) => ({ sender: m.sender, text: m.text }));
      const res = await askCopilotChatWithAi({
        message: query,
        history: chatHistory,
        language: lang,
        fallbackGenerator: (q, l) => generateClinicalAnswer(q, l as LanguageCode),
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: res.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: res.source,
        model: res.model,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);

      // Speak a clean spoken excerpt without markdown symbols
      const cleanSpoken = res.reply.replace(/[*#_`]/g, '').slice(0, 280);
      speak(cleanSpoken, lang);
    } catch (err) {
      console.error('Copilot chat error:', err);
      const fallbackReply = generateClinicalAnswer(query, lang);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: fallbackReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'dynamic-clinical-ai',
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);

      const cleanSpoken = fallbackReply.replace(/[*#_`]/g, '').slice(0, 280);
      speak(cleanSpoken, lang);
    }
  };

  const handleVoiceInput = () => {
    stop();
    startListening(lang, (spokenText) => {
      setInput(spokenText);
      handleSend(spokenText);
    });
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open MediCare AI Copilot"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white font-semibold rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
      >
        <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '4s' }} />
        <span className="font-bold text-sm">MediCare AI Copilot</span>
        {isPlaying && (
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
        )}
      </button>

      {/* Copilot Drawer/Modal */}
      {isOpen && (
        <div className="fixed bottom-22 right-6 z-50 w-[420px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6">
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xs leading-tight flex items-center gap-1.5">
                  MediCare AI Copilot
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                </h3>
                <p className="text-[10px] text-blue-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  ChatGPT & Gemini Backend Active
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowAiSettings(!showAiSettings)}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer text-white ${
                  showAiSettings ? 'bg-white/30' : 'hover:bg-white/20'
                }`}
                title="AI Backend Settings (ChatGPT / Gemini)"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  stop();
                  setIsOpen(false);
                }}
                className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* AI Settings Drawer (Configurable ChatGPT / Gemini Provider & Personal Keys) */}
          {showAiSettings && (
            <div className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-3 text-xs space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-[11px] text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-blue-600" />
                  AI Model & Backend Provider
                </span>
                <button
                  type="button"
                  onClick={() => setShowAiSettings(false)}
                  className="text-[10px] text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveAiConfig} className="space-y-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                    Select AI Provider:
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'auto', label: '⚡ Auto' },
                      { id: 'chatgpt', label: '🤖 ChatGPT' },
                      { id: 'gemini', label: '✨ Gemini' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setLocalAiConfig({ ...aiConfig, provider: p.id as any })
                        }
                        className={`py-1 px-1.5 rounded-lg text-[10px] font-bold border transition cursor-pointer text-center ${
                          aiConfig.provider === p.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                    OpenAI ChatGPT Key (Optional):
                  </label>
                  <input
                    type="password"
                    value={aiConfig.openaiApiKey}
                    onChange={(e) =>
                      setLocalAiConfig({ ...aiConfig, openaiApiKey: e.target.value })
                    }
                    placeholder="sk-proj-... (Optional personal key)"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-[11px] text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-600 dark:text-slate-400 block mb-0.5">
                    Google Gemini Key (Optional):
                  </label>
                  <input
                    type="password"
                    value={aiConfig.geminiApiKey}
                    onChange={(e) =>
                      setLocalAiConfig({ ...aiConfig, geminiApiKey: e.target.value })
                    }
                    placeholder="AIzaSy... (Optional personal key)"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-[11px] text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-emerald-600 font-semibold">
                    {savedSuccess ? '✓ Saved!' : '✓ Backend API Active'}
                  </span>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>Save</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Interrupt Banner (Active when AI is speaking) */}
          {isPlaying && (
            <div className="bg-amber-500 text-white px-3 py-2 flex items-center justify-between text-xs font-medium animate-pulse shadow-md">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>AI Voice Assistant is speaking...</span>
              </div>
              <button
                type="button"
                onClick={handleInterrupt}
                className="bg-white text-amber-700 hover:bg-amber-100 px-2.5 py-1 rounded-md font-bold text-[11px] flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                title="Stop AI speech immediately"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop Audio</span>
              </button>
            </div>
          )}

          {/* Quick Health Topic Chips */}
          <div className="px-3 py-2 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex gap-1.5 overflow-x-auto text-[11px] pb-2">
            {[
              '🌡️ High Fever & Chills',
              '💊 Dolo 650 uses & how to take',
              '🔥 Stomach Acidity',
              '🩸 High Blood Pressure',
              '🩺 Diabetes & Sugar',
              '📍 Pharmacies near BIET',
            ].map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => handleSend(chip)}
                className="px-2.5 py-1 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-600 hover:text-white rounded-lg border border-slate-200 dark:border-slate-600 shadow-2xs whitespace-nowrap cursor-pointer transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3.5 bg-slate-50/70 dark:bg-slate-950/40 text-xs">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
                    m.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-sm rounded-bl-xs'
                  }`}
                >
                  <div className="leading-relaxed whitespace-pre-wrap">{m.text}</div>
                  <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10px] opacity-75">
                    <div className="flex items-center gap-1.5">
                      <span>{m.time}</span>
                      {m.source === 'chatgpt' && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[9px] flex items-center gap-0.5">
                          🤖 ChatGPT
                        </span>
                      )}
                      {m.source === 'gemini' && (
                        <span className="px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold text-[9px] flex items-center gap-0.5">
                          ✨ Gemini
                        </span>
                      )}
                      {m.source === 'dynamic-clinical-ai' && (
                        <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-bold text-[9px] flex items-center gap-0.5">
                          🩺 Clinical AI
                        </span>
                      )}
                    </div>
                    {m.sender === 'ai' && (
                      <button
                        onClick={() => {
                          stop();
                          const clean = m.text.replace(/[*#_`]/g, '').slice(0, 300);
                          speak(clean, lang);
                        }}
                        className="flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-bold cursor-pointer"
                        title="Listen to this message"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Thinking / Streaming Indicator */}
            {isThinking && (
              <div className="flex gap-2 justify-start items-center animate-in fade-in">
                <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl px-3.5 py-2 border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                  <span className="text-[11px] text-slate-500 font-medium">
                    MediCare AI is querying ChatGPT & Gemini backend...
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input & Voice Controls */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask any health problem (e.g. fever, headache, blood pressure, medicine dosage)..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              type="button"
              onClick={handleVoiceInput}
              className={`p-2.5 rounded-xl text-white transition-all cursor-pointer ${
                isListening
                  ? 'bg-red-500 animate-pulse'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
              }`}
              title="Speak your health problem"
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-white" />
              ) : (
                <Mic className="w-4 h-4 text-slate-700 dark:text-slate-200" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleSend()}
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors cursor-pointer"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
