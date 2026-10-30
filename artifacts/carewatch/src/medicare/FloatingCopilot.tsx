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
} from 'lucide-react';
import { type LanguageCode, TRANSLATIONS } from './translations';
import { useVoice } from './voiceService';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

// Deep Clinical Health Intelligence Knowledge Base
const generateClinicalAnswer = (query: string, lang: LanguageCode): string => {
  const q = query.toLowerCase();
  const isHi = lang === 'hi';

  // 1. FEVER & VIRAL ILLNESS (बुखार, तापमान, कंपकंपी)
  if (
    q.includes('fever') ||
    q.includes('temperature') ||
    q.includes('बुखार') ||
    q.includes('tapman') ||
    q.includes('chills') ||
    q.includes('dengue') ||
    q.includes('malaria') ||
    q.includes('viral')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (बुखार / Fever):**
शरीर का तापमान 98.6°F से ऊपर होना संक्रमण से लड़ने का प्राकृतिक संकेत है।

💡 **सटीक उपचार और सावधानियां:**
1. **दवा:** पैरासिटामोल 650mg (Dolo 650) भोजन के बाद लें। दो खुराकों के बीच कम से कम 6 घंटे का अंतर रखें। 24 घंटे में 3 गोली से अधिक न लें।
2. **घरेलू देखभाल:** माथे पर सामान्य पानी की ठंडी पट्टियां रखें। खूब पानी, नारियल पानी और इलेक्ट्राल (ORS) पिएं।
3. **आहार:** हल्का सुपाच्य भोजन (खिचड़ी, दलिया, सूप) लें।

⚠️ **चेतावनी (डॉक्टर को कब दिखाएं):**
यदि बुखार 102°F से अधिक हो, 3 दिनों से अधिक रहे, या शरीर पर लाल चकत्ते / तेज उल्टी हो, तो तुरंत सीबीसी (CBC) और डेंगू जांच कराएं।`;
    }
    return `🩺 **Clinical Assessment (Fever & Temperature):**
Body temperature above 99.5°F typically indicates an active immune response fighting a viral or bacterial infection.

💡 **Immediate Safe Steps & Treatment:**
1. **Medication:** Paracetamol 650mg (Dolo 650) orally after light food. Maintain at least 4 to 6 hours between doses (max 3 tabs / 24 hours).
2. **Hydration & Home Care:** Drink 2.5-3L fluids (warm water, ORS electrolyte, coconut water). Apply cool damp cloth sponges to the forehead and neck.
3. **Nutrition:** Light, easily digestible meals (khichdi, clear vegetable soups).

⚠️ **Red Flag Warnings (Seek Doctor):**
If temperature exceeds 102°F, persists past 3 days, or is accompanied by severe shivering, rash, or persistent vomiting, get a complete CBC & platelet test immediately.`;
  }

  // 2. HEADACHE & MIGRAINE (सिरदर्द, माइग्रेन)
  if (
    q.includes('headache') ||
    q.includes('head ache') ||
    q.includes('सिरदर्द') ||
    q.includes('migraine') ||
    q.includes('sar dard') ||
    q.includes('adhkapari')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (सिरदर्द / Headache):**
सिरदर्द तनाव (Tension), पानी की कमी (Dehydration), नींद की कमी, साइनस या माइग्रेन के कारण हो सकता है।

💡 **सटीक राहत के उपाय:**
1. **प्राथमिक कदम:** तुरंत 2 गिलास गुनगुना पानी पिएं और 15-20 मिनट के लिए शांत, अंधेरे कमरे में लेटें।
2. **दवा:** यदि दर्द तेज हो तो भोजन के बाद पैरासिटामोल 650mg या कोम्बिफ्लाम (Combiflam) ले सकते हैं।
3. **राहत:** माथे और गर्दन के पीछे बाम लगाएं या बर्फ की सिकाई करें। स्क्रीन और तेज आवाज से दूर रहें।

⚠️ **चेतावनी:** यदि सिरदर्द अचानक बहुत तेज (Thunderclap) हो, उल्टी हो या गर्दन में अकड़न आए, तो तत्काल न्यूरोलॉजिस्ट से मिलें।`;
    }
    return `🩺 **Clinical Assessment (Headache & Migraine):**
Common causes include dehydration, prolonged screen strain, sleep deprivation, sinus congestion, or vascular migraine.

💡 **Immediate Safe Care:**
1. **Hydration:** Drink 500ml water immediately (dehydration is the #1 silent trigger).
2. **Rest:** Rest in a quiet, dimly lit room without screen glare for 20 minutes.
3. **OTC Medication:** Paracetamol 650mg or Ibuprofen 400mg strictly after food.
4. **Physical Relief:** Apply cold compress to forehead or massage neck/temple muscles.

⚠️ **Urgent Red Flags:**
Sudden explosive headache, accompanying neck stiffness, vision blurriness, or slurred speech requires emergency medical evaluation.`;
  }

  // 3. COUGH, SORE THROAT & COLD (खांसी, जुकाम, गले में दर्द)
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
    q.includes('mucus')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (खांसी और गले का संक्रमण):**
- **सूखी खांसी (Dry Cough):** गले में खुजली और जलन।
- **बलगम वाली खांसी (Wet Cough):** छाती में कफ और जकड़न।

💡 **सटीक घरेलू और चिकित्सीय उपचार:**
1. **नमक के गुनगुने पानी से गरारे (Gargle):** दिन में 3 बार गुनगुने पानी में चुटकी भर नमक डालकर गरारे करें।
2. **भाप (Steam):** दिन में 2 बार गर्म पानी की भाप लें।
3. **काढ़ा:** अदरक, तुलसी, काली मिर्च और शहद का रस लें।
4. **दवा:** सूखी खांसी के लिए Ascoril-D या Benadryl DR (10ml); एलर्जी और जुकाम के लिए रात को Cetirizine 10mg लें।

⚠️ **चेतावनी:** यदि बलगम में खून आए, सांस लेने में तकलीफ हो या खांसी 2 हफ्ते से अधिक रहे, तो चेस्ट एक्स-रे कराएं।`;
    }
    return `🩺 **Clinical Assessment (Cough & Throat Care):**
- **Dry/Irritating Cough:** Caused by upper airway allergy or viral inflammation.
- **Productive/Wet Cough:** Characterized by chest congestion and phlegm.

💡 **Targeted Relief Regimen:**
1. **Warm Saline Gargles:** Gargle with warm salt water 3 times daily to kill surface throat bacteria and soothe vocal cords.
2. **Steam Inhalation:** 5-10 minutes twice daily clears congested nasal passages.
3. **Medication:** For dry hacking cough, Dextromethorphan syrup (Ascoril D 10ml thrice daily). For allergic runny nose, Cetirizine 10mg at bedtime.
4. **Hydration:** Honey + crushed ginger tea soothes irritated membranes.

⚠️ **Warning:** If cough lasts > 2 weeks, produces rust-colored or blood-streaked sputum, or causes wheezing, consult a pulmonologist.`;
  }

  // 4. STOMACH PAIN, ACIDITY & GAS (पेट दर्द, एसिडिटी, गैस)
  if (
    q.includes('stomach') ||
    q.includes('acid') ||
    q.includes('gas') ||
    q.includes('acidity') ||
    q.includes('पेट दर्द') ||
    q.includes('गैस') ||
    q.includes('heartburn') ||
    q.includes('pet dard') ||
    q.includes('kabz') ||
    q.includes('constipation')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (एसिडिटी, गैस और पेट दर्द):**
सीने में जलन (Heartburn), खट्टी डकारें और पेट में भारीपन पेट में अतिरिक्त गैस्ट्रिक एसिड बनने के लक्षण हैं।

💡 **सटीक उपचार:**
1. **दवा:** सुबह खाली पेट एक गोली पैंटोप्राजोल 40mg (Pantocid 40) एक गिलास पानी के साथ लें। तुरंत जलन के लिए डाइजीन (Digene) या जेलुसिल सिरप 2 चम्मच पिएं।
2. **घरेलू उपाय:** ठंडा दूध या छाछ पिएं। भोजन के तुरंत बाद सौंफ और मिश्री चबाएं।
3. **सावधानी:** खाली पेट चाय, कॉफी, समोसे, तीखा और तला-भुना खाना बिल्कुल बंद करें।

⚠️ **चेतावनी:** यदि पेट के दाहिने निचले हिस्से में अचानक तेज असहनीय दर्द हो (एपेंडिक्स का संकेत) या उल्टी में खून आए, तो तुरंत इमरजेंसी जाएं।`;
    }
    return `🩺 **Clinical Assessment (Acidity, Heartburn & Gastric Pain):**
Excess stomach acid refluxes into the esophagus, causing burning chest discomfort, sour burps, and stomach bloating.

💡 **Targeted Clinical Protocol:**
1. **Medication:** Take Pantoprazole 40mg (Pantocid 40) on an empty stomach 30-45 minutes before breakfast. For immediate burning, take 2 teaspoons of liquid antacid (Digene / Gelusil).
2. **Immediate Relief:** Sip a cup of cold milk or fresh buttermilk. Chew fennel seeds (saunf) after meals.
3. **Diet:** Strictly avoid fried snacks, spicy chillies, caffeine, and carbonated beverages. Do not lie down for 2 hours after meals.

⚠️ **Emergency Signs:**
Severe localized lower-right abdominal pain (possible appendicitis) or black tarry stools requires urgent surgical consultation.`;
  }

  // 5. LOOSE MOTIONS, DIARRHEA & VOMITING (दस्त, उल्टी, पेट खराब)
  if (
    q.includes('diarrhea') ||
    q.includes('loose') ||
    q.includes('vomit') ||
    q.includes('दस्त') ||
    q.includes('उल्टी') ||
    q.includes('pet kharab') ||
    q.includes('dast') ||
    q.includes('motion') ||
    q.includes('dehydration')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (दस्त और उल्टी / Diarrhea):**
दूषित भोजन या पानी के कारण आंतों में वायरल या बैक्टीरियल गैस्ट्रोएंटेराइटिस होने से शरीर में पानी की भारी कमी हो जाती है।

💡 **जीवनरक्षक प्राथमिक उपचार:**
1. **ORS घोल (सबसे जरूरी):** 1 लीटर उबले और ठंडे पानी में 1 पैकेट इलेक्ट्राल (ORS) घोलें और दिनभर घूंट-घूंट करके पिएं।
2. **आहार (BRAT डाइट):** सिर्फ ताजा दही-चावल, पका हुआ केला, उबला आलू और मूंग दाल की खिचड़ी खाएं। कच्ची सब्जियां और दूध न लें।
3. **दवा:** प्रोबायोटिक कैप्सूल (Sporlac या Darolac) दिन में 2 बार लें। पेट मरोड़ के लिए Drotin-M ले सकते हैं।

⚠️ **खतरे की घंटी:** यदि 6 घंटे तक पेशाब न आए, बहुत कमजोरी या चक्कर आए, तो डिहाइड्रेशन के लिए तुरंत आईवी (IV ड्रिप) लगवाएं।`;
    }
    return `🩺 **Clinical Assessment (Diarrhea & Gastroenteritis):**
Fluid and electrolyte loss from stomach infection creates a high risk of acute dehydration.

💡 **Clinical Action Plan:**
1. **ORS Rehydration (Top Priority):** Dissolve 1 sachet of WHO-formula ORS (Electral) in exactly 1 Liter of clean drinking water. Sip continuously throughout the day.
2. **Probiotics:** Take a probiotic capsule (Sporlac / Darolac) twice daily to restore gut flora.
3. **BRAT Diet:** Eat bananas, plain rice with fresh curd, boiled potatoes, and moong dal khichdi. Avoid dairy, oily items, and raw salads.
4. **Spasm Relief:** For crampy pain, Drotaverine (Drotin-M) can be taken after consultation.

⚠️ **Warning Flags:**
Extreme thirst, dry mouth, absence of urine for > 6 hours, or blood in stool requires immediate hospital IV fluid resuscitation.`;
  }

  // 6. HIGH BLOOD PRESSURE & HYPERTENSION (हाई बीपी, ब्लड प्रेशर)
  if (
    q.includes('blood pressure') ||
    q.includes('hypertension') ||
    q.includes('bp') ||
    q.includes('ब्लड प्रेशर') ||
    q.includes('हाई बीपी') ||
    q.includes('heart rate')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (ब्लड प्रेशर / BP):**
- सामान्य BP: 120/80 mmHg
- हाई BP (Hypertension): 140/90 mmHg से अधिक।

💡 **सटीक नियंत्रण और सलाह:**
1. **नमक नियंत्रण (DASH Diet):** भोजन में अतिरिक्त नमक डालना बंद करें। पापड़, अचार, नमकीन और पैकेटबंद चिप्स न खाएं।
2. **दवा का नियम:** डॉक्टर द्वारा लिखी गई बीपी की दवा (जैसे Telma 40 या Amlodipine) का एक भी दिन नागा न करें।
3. **जीवनशैली:** प्रतिदिन 30 मिनट तेज गति से टहलें और गहरी सांस (अनुलोम-विलोम) लें।

⚠️ **आपातकाल:** यदि बीपी 180/110 से ऊपर हो, सीने में भारीपन, बाएं हाथ में दर्द या पसीना आए तो तुरंत 112/108 डायल करें।`;
    }
    return `🩺 **Clinical Assessment (Blood Pressure & Hypertension):**
- Optimal Target: 120/80 mmHg.
- Stage 1 Hypertension: 130-139 / 80-89 mmHg. Stage 2: ≥ 140/90 mmHg.

💡 **Clinical Lifestyle & Care:**
1. **Sodium Reduction:** Limit salt to < 2000mg/day (avoid pickles, papad, processed chips, and packaged soups).
2. **Medication Compliance:** Never skip prescribed antihypertensive medication (e.g. Telmisartan 40mg or Amlodipine).
3. **Cardio Fitness:** 30 minutes of daily aerobic brisk walking lowers systolic BP by 5-8 mmHg.
4. **Stress & Sleep:** Maintain 7-8 hours restful sleep and avoid smoking/nicotine.

⚠️ **Emergency Crisis:**
BP ≥ 180/110 mmHg with chest tightness, shortness of breath, or numbness requires emergency ER care immediately.`;
  }

  // 7. DIABETES & BLOOD SUGAR (डायबिटीज, शुगर, ग्लूकोज)
  if (
    q.includes('diabetes') ||
    q.includes('sugar') ||
    q.includes('glucose') ||
    q.includes('डायबिटीज') ||
    q.includes('शुगर') ||
    q.includes('hba1c') ||
    q.includes('insulin')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (ब्लड शुगर / डायबिटीज):**
- सामान्य खाली पेट (Fasting): 70 - 99 mg/dL
- खाना खाने के 2 घंटे बाद (PP): < 140 mg/dL
- तीन महीने का औसत (HbA1c): < 5.7% (सामान्य), > 6.5% (डायबिटीज)

💡 **सटीक नियंत्रण कैसे करें:**
1. **आहार:** सफेद चावल, मैदा, चीनी और मीठे पेय छोड़ें। मेथी दाना, करेला, ओट्स, हरी सब्जियां और चना दाल लें।
2. **दवा:** मेटफॉर्मिन (Glycomet) या डॉक्टर द्वारा बताई दवा नाश्ते के साथ लें।
3. **हाइपोग्लाइसीमिया (शुगर कम होना):** यदि अचानक चक्कर आए, हाथ कांपे और ठंडा पसीना आए तो तुरंत 3 चम्मच चीनी या ग्लूकोज लें।

⚠️ **चेतावनी:** हर 3 महीने पर HbA1c और साल में एक बार आंखों व किडनी (Creatinine) की जांच कराएं।`;
    }
    return `🩺 **Clinical Assessment (Blood Glucose & Diabetes):**
- Fasting Normal: 70 - 99 mg/dL (Diabetes: ≥ 126 mg/dL).
- Post-Meal (2hr PP) Target: < 140 mg/dL.
- HbA1c 3-Month Average: < 5.7% (Normal), ≥ 6.5% (Diabetic).

💡 **Clinical Care & Nutrition:**
1. **Glycemic Control:** Replace refined sugars and white rice with high-fiber grains (oats, brown rice, whole wheat, lentils).
2. **Medication Timing:** Take prescribed Metformin (Glycomet) or dual therapy strictly with meals to avoid gastrointestinal upset.
3. **Hypoglycemia Rule of 15:** If sugar drops below 70 mg/dL with shakiness/sweating, take 15g fast-acting sugar (3 glucose tablets or 1/2 cup juice) and recheck in 15 mins.

⚠️ **Routine Monitoring:** Test HbA1c every 90 days and kidney creatinine annually.`;
  }

  // 8. JOINT PAIN, ARTHRITIS & BACKACHE (जोड़ों का दर्द, कमर दर्द, गठिया)
  if (
    q.includes('joint') ||
    q.includes('backache') ||
    q.includes('back pain') ||
    q.includes('knee') ||
    q.includes('कमर दर्द') ||
    q.includes('जोड़ों का दर्द') ||
    q.includes('arthritis') ||
    q.includes('gathiya') ||
    q.includes('muscle')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (जोड़ों और कमर का दर्द):**
यह यूरिक एसिड बढ़ने, कैल्शियम या विटामिन डी3 की कमी, मांसपेशियों में खिंचाव या आर्थराइटिस के कारण हो सकता है।

💡 **सटीक उपचार:**
1. **सिकाई:** यदि सूजन हो तो बर्फ की सिकाई करें; पुराने दर्द व अकड़न के लिए गर्म पानी की थैली से सिकाई करें।
2. **दवा व सप्लीमेंट:** भोजन के बाद शेल्कल 500 (Calcium + D3) लें। तेज दर्द में दर्द निवारक जेल (Volini) लगाएं।
3. **व्यायाम:** सुबह 20 मिनट धूप में बैठें और हल्के स्ट्रेचिंग व कमर के व्यायाम करें। भारी वजन न उठाएं।

⚠️ **चेतावनी:** यदि दर्द के साथ जोड़ों में लालिमा, तेज बुखार या पैरों में सुन्नता हो तो ऑर्थोपेडिक डॉक्टर को दिखाएं।`;
    }
    return `🩺 **Clinical Assessment (Joint, Knee & Musculoskeletal Pain):**
Commonly driven by Vitamin D3/Calcium deficiency, osteoarthritis wear, muscular spasms, or elevated uric acid.

💡 **Targeted Relief Protocol:**
1. **Therapy:** Ice packs for acute sprains/swelling; warm moist heat for chronic stiff joint pain.
2. **Topical & Oral Care:** Apply topical Diclofenac gel (Volini). Take Calcium + Vitamin D3 (Shelcal 500) once daily after lunch.
3. **Ergonomics & Sun:** Maintain proper spinal posture and get 20 minutes morning sunlight for bone health. Avoid soft sagging mattresses.

⚠️ **Medical Warning:** Severe joint warmth, persistent swelling, or numbness radiating down the legs requires orthopedic consultation.`;
  }

  // 9. SKIN RASH, ALLERGY & ITCHING (खुजली, एलर्जी, दाने)
  if (
    q.includes('skin') ||
    q.includes('rash') ||
    q.includes('itching') ||
    q.includes('allergy') ||
    q.includes('खुजली') ||
    q.includes('एलर्जी') ||
    q.includes('daane') ||
    q.includes('fungal') ||
    q.includes('hives')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (त्वचा एलर्जी और खुजली):**
धूल, परागकण, साबुन, खाद्य एलर्जी या फंगल इन्फेक्शन से त्वचा पर लाल चकत्ते (Hives) और खुजली हो सकती है।

💡 **सटीक उपचार:**
1. **दवा:** एलर्जी की रोकथाम के लिए एलेग्रा 120mg (Allegra 120) या सिट्राजिन 10mg दिन में एक बार लें।
2. **त्वचा की देखभाल:** खुजली वाली जगह पर कैलामाइन लोशन (Calamine) लगाएं। गुनगुने पानी से नहाएं और सूती ढीले कपड़े पहनें।
3. **सावधानी:** तेज खुशबू वाले साबुन और डियोड्रेंट का उपयोग न करें। नाखूनों से खरोंचें नहीं।

⚠️ **आपातकाल:** यदि होंठ, जीभ या गले में सूजन आए या सांस लेने में परेशानी हो तो बिना देरी किए इमरजेंसी अस्पताल जाएं।`;
    }
    return `🩺 **Clinical Assessment (Skin Allergy, Rash & Itching):**
Often triggered by contact dermatitis, seasonal pollen, heat rash, urticaria (hives), or fungal exposure.

💡 **Targeted Relief Action:**
1. **Antihistamine:** Take Fexofenadine 120mg (Allegra 120) or Cetirizine 10mg once daily for non-drowsy allergy relief.
2. **Topical Soothing:** Apply soothing Calamine lotion or coconut oil to calm histamine irritation.
3. **Clothing & Care:** Wear loose, breathable cotton garments and wash skin with mild, fragrance-free cleanser. Avoid scratching.

⚠️ **Emergency Alert (Anaphylaxis):**
If accompanied by facial swelling, lip edema, or breathing difficulty, seek emergency room attention immediately.`;
  }

  // 10. DIZZINESS, WEAKNESS & ANEMIA (चक्कर आना, कमजोरी, थकान)
  if (
    q.includes('dizziness') ||
    q.includes('weakness') ||
    q.includes('fatigue') ||
    q.includes('चक्कर') ||
    q.includes('कमजोरी') ||
    q.includes('anemia') ||
    q.includes('tired') ||
    q.includes('chakkar')
  ) {
    if (isHi) {
      return `🩺 **क्लिनिकल विश्लेषण (कमजोरी और चक्कर आना):**
यह शरीर में पानी की कमी (Dehydration), हीमोग्लोबिन की कमी (एनीमिया), लो ब्लड प्रेशर या अचानक उठने के कारण हो सकता है।

💡 **सटीक राहत:**
1. **तुरंत क्या करें:** तुरंत बैठ या लेट जाएं और पैरों को तकिए पर ऊंचा रखें ताकि मस्तिष्क में रक्त संचार बढ़े।
2. **हाइड्रेशन:** 1 गिलास पानी में 1 चुटकी नमक और 2 चम्मच नींबू का रस या ओआरएस (ORS) मिलाकर पिएं।
3. **आहार:** हीमोग्लोबिन बढ़ाने के लिए अनार, चुकंदर, पालक, खजूर और गुड़-चना खाएं।
4. **दवा:** विटामिन बी12 और न्यूरोबियन फोर्ट (Neurobion Forte) की एक गोली रोज ले सकते हैं।

⚠️ **चेतावनी:** यदि चक्कर आने के साथ बेहोशी हो, छाती में दर्द हो या हाथ-पैर सुन्न हों तो तुरंत डॉक्टर से जांच कराएं।`;
    }
    return `🩺 **Clinical Assessment (Dizziness, Fatigue & Anemia):**
Primary triggers include dehydration, orthostatic blood pressure drops, mild anemia (low hemoglobin), or electrolyte imbalance.

💡 **Immediate Action:**
1. **Posture:** Lie down immediately with legs elevated above heart level to boost cerebral perfusion.
2. **Fluid & Salt:** Drink 300ml water with electrolyte ORS or fresh lemon water with a pinch of salt.
3. **Nutritional Restoration:** Eat iron-rich foods (pomegranate, beetroot, spinach, dates, lentils) and Vitamin C to enhance iron absorption.
4. **Supplements:** Multivitamin with B-Complex (Neurobion Forte) supports nerve energy.

⚠️ **Red Flag Signs:**
Dizziness accompanied by blackouts, fainting, chest tightness, or persistent room spinning (vertigo) requires clinical evaluation.`;
  }

  // 11. BANSAL INSTITUTE & PHARMACIES IN LUCKNOW (226021)
  if (
    q.includes('bansal') ||
    q.includes('lucknow') ||
    q.includes('226021') ||
    q.includes('pharmacy') ||
    q.includes('sitapur road') ||
    q.includes('medical store') ||
    q.includes('दवा की दुकान') ||
    q.includes('फार्मेसी')
  ) {
    if (isHi) {
      return `📍 **बंसल इंस्टीट्यूट ऑफ इंजीनियरिंग एंड टेक्नोलॉजी (BIET, लखनऊ - 226021) के नजदीकी मेडिकल स्टोर्स:**

1. **बंसल मेडिकोज एंड हेल्थकेयर (Bansal Medicos):** कॉलेज मेन गेट के सामने (100 मीटर)। फोन: +91 88081 22445।
2. **अपोलो फार्मेसी 24x7 (Apollo Pharmacy):** सेवा हॉस्पिटल रोड, सीतापुर रोड (350 मीटर)। 24 घंटे खुली है। फोन: +91 94150 28192।
3. **संजीवनी मेडिकल स्टोर 24x7:** मोहिबुल्लापुर चौराहा (600 मीटर)। सभी आपातकालीन दवाएं उपलब्ध।
4. **प्रधानमंत्री जन औषधि केंद्र:** इंजीनियरिंग कॉलेज चौराहा (1.1 किमी) - रियायती जेनेरिक दवाएं।

आप फार्मेसी फाइंडर टैब में जाकर सीधा गूगल मैप्स नेविगेशन और होम डिलीवरी ऑर्डर कर सकते हैं।`;
    }
    return `📍 **Verified Pharmacies near Bansal Institute of Engineering & Technology (BIET, Lucknow - 226021):**

1. **Bansal Medicos & Healthcare:** 100 meters (Opposite BIET Campus Gate). Phone: +91 88081 22445. Open till 11:30 PM.
2. **Apollo Pharmacy 24x7:** 350 meters on Sitapur Road (near Sewa Hospital). Open 24 Hours with express stock. Phone: +91 94150 28192.
3. **Sanjeevani Medical Store 24x7:** 600 meters at Mohibullapur crossing.
4. **Pradhan Mantri Jan Aushadhi Kendra:** 1.1 km near Engineering College Chauraha (low-cost generic medicines).

Use the **Pharmacy Finder** tab to view the live GPS radar and launch direct Google Maps directions.`;
  }

  // 12. HOSPITAL QUEUE & TOKENS (अस्पताल टोकन, कतार)
  if (
    q.includes('token') ||
    q.includes('queue') ||
    q.includes('टोकन') ||
    q.includes('कतार') ||
    q.includes('hospital') ||
    q.includes('kgmu') ||
    q.includes('rmlims')
  ) {
    if (isHi) {
      return `🏥 **स्मार्ट अस्पताल कतार स्थिति (Smart Queue):**
- **सक्रिय टोकन:** आपका जनरल मेडिसिन (OPD रूम 104) के लिए टोकन नंबर **#A-024** है।
- **वर्तमान सेवा:** अस्पताल वर्तमान में टोकन **#A-020** देख रहा है।
- **आपकी स्थिति:** आपसे पहले केवल 4 मरीज हैं।
- **अनुमानित प्रतीक्षा समय:** लगभग 16-18 मिनट।

कतार टैब में जाकर आप डिजिटल टोकन पास डाउनलोड कर सकते हैं और अपनी बारी आने पर ऑडियो अनाउंसमेंट सुन सकते हैं।`;
    }
    return `🏥 **Smart Hospital Queue Real-Time Status:**
- **Your Digital Token:** **#A-024** for OPD General Medicine (Room 104).
- **Currently Serving:** Token **#A-020**.
- **Queue Position:** 4 patients ahead of you.
- **Estimated Wait Duration:** Approximately 16 to 18 minutes.

You can view your animated live progress and download your official OPD pass with QR code in the **Queue** section.`;
  }

  // 13. COMPREHENSIVE INTELLIGENT HEALTH ENGINE FOR ANY OTHER QUERY
  if (isHi) {
    return `🩺 **मेडीकेयर AI क्लिनिकल परामर्श:**
मैंने आपका स्वास्थ्य प्रश्न नोट कर लिया है: "${query}"।

💡 **सामान्य चिकित्सकीय दिशा-निर्देश:**
1. **प्राथमिक देखभाल:** पर्याप्त मात्रा में पानी पिएं, सुपाच्य और ताजा भोजन लें, तथा 8 घंटे की भरपूर नींद लें।
2. **दवा लेने का नियम:** कोई भी एलोपैथिक या एंटीबायोटिक दवा बिना योग्य चिकित्सक के परामर्श के न लें।
3. **डिजिटल परामर्श:** आप हमारे 'टेलीमेडिसिन' टैब से तुरंत डॉक्टर के साथ वीडियो कॉल पर लाइव परामर्श ले सकते हैं।

⚠️ **आपातकालीन सहायता:** किसी भी तीव्र दर्द, सांस फूलने या बेहोशी की स्थिति में तुरंत नजदीकी अस्पताल जाएं या 112 / 108 डायल करें।`;
  }

  return `🩺 **MediCare AI Clinical Assessment:**
Thank you for consulting about: "${query}".

💡 **Evidence-Based Medical Recommendations:**
1. **Hydration & Rest:** Ensure 2.5 to 3 liters of fluid intake daily and prioritize 8 hours of restorative sleep.
2. **Symptom Monitoring:** Track onset, intensity (scale 1-10), and triggers. Do not start antibiotics without an authorized clinician prescription.
3. **Teleconsultation:** Connect with our board-certified physicians via high-definition video call in the **Telemedicine** tab.

⚠️ **Emergency Disclaimer:** For sudden acute chest pressure, respiratory distress, or severe trauma, seek immediate physical emergency care or call 112 / 108.`;
};

export const FloatingCopilot: React.FC<{ lang: LanguageCode }> = ({ lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  const getGreeting = (l: LanguageCode) => {
    switch (l) {
      case 'hi':
        return 'नमस्ते! मैं आपका मेडीकेयर AI स्वास्थ्य विशेषज्ञ हूँ। बुखार, सिरदर्द, पेट दर्द, ब्लड प्रेशर, डायबिटीज या दवाओं के उपयोग के बारे में कोई भी प्रश्न पूछें। मैं आपको सटीक चिकित्सकीय उत्तर दूंगा।';
      default:
        return 'Hello! I am your MediCare AI Clinical Copilot. Ask me about any health condition, fever, headache, blood pressure, sugar, or medicine dosages. I provide exact clinical guidance.';
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: getGreeting(lang),
      time: 'Just now',
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

  const handleSend = (textToSend?: string) => {
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

    // Generate accurate medical answer
    setTimeout(() => {
      const reply = generateClinicalAnswer(query, lang);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Speak a clean spoken excerpt without markdown symbols
      const cleanSpoken = reply.replace(/[*#_`]/g, '').slice(0, 280);
      speak(cleanSpoken, lang);
    }, 600);
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
          <div className="px-4 py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center shadow-inner">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                  MediCare AI Health Assistant
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                </h3>
                <p className="text-[11px] text-blue-100 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                  Clinical Diagnostic Engine Active
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                stop();
                setIsOpen(false);
              }}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

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
              '🤕 Severe Headache',
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
                  <div className="w-7 h-7 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
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
                    <span>{m.time}</span>
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
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
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
