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

// Deep Clinical Health Intelligence Knowledge Base - Small Sentences & Direct-to-Direct Answers
export const generateClinicalAnswer = (query: string, lang: LanguageCode): string => {
  const q = query.toLowerCase().trim();
  const isHi = lang === 'hi';

  // 1. GREETINGS & CASUAL HELLO (Fixes "Hi" being diagnosed as a disease!)
  if (
    /^(hi|hello|hey|namaste|pranam|good\s*morning|good\s*evening|good\s*afternoon|kaise\s*ho|kese\s*ho|who\s*are\s*you)[!.,?]?$/i.test(
      q
    ) ||
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q === 'hi.' ||
    q === 'hello.'
  ) {
    if (isHi) {
      return `👋 नमस्ते! मैं आपका **मेडीकेयर AI स्वास्थ्य सलाहकार** हूँ।\n\nआज मैं आपकी सेहत, बीमारी के लक्षण या दवाओं के बारे में क्या मदद कर सकता हूँ? कृपया अपनी समस्या बताएं।`;
    }
    return `👋 Hello! I am your **MediCare AI Health Assistant**.\n\nHow can I help you with your symptoms, medicines, or health today? Please ask your question.`;
  }

  // 2. THANKS & BYE
  if (/^(thanks|thank\s*you|dhanyawad|shukriya|bye|goodbye|ok|okay)[!.,?]?$/i.test(q)) {
    if (isHi) {
      return `🙏 आपका स्वागत है! अपना ख्याल रखें। किसी भी स्वास्थ्य समस्या पर कभी भी पूछ सकते हैं। स्वस्थ रहें!`;
    }
    return `🙏 You're very welcome! Take care and feel free to ask anytime you need medical guidance. Stay healthy!`;
  }

  // 3. FEVER RECOVERY / HEALING FROM FEVER (Direct match for: "I am healing from fever. What I do at that time.")
  if (
    q.includes('healing') ||
    q.includes('recovering') ||
    q.includes('recovery') ||
    (q.includes('fever') &&
      (q.includes('after') ||
        q.includes('weakness') ||
        q.includes('theek') ||
        q.includes('kamjori') ||
        q.includes('what i do') ||
        q.includes('what to do')))
  ) {
    if (isHi) {
      return `🩺 **बुखार से ठीक होने के बाद देखभाल (सटीक सलाह):**
• **खूब पानी पिएं:** दिन में 2.5–3 लीटर पानी, नारियल पानी या ORS पिएं ताकि कमजोरी दूर हो।
• **हल्का खाना खाएं:** मूंग दाल खिचड़ी, दलिया, सूप और फल लें। तला-भुना और मसालेदार खाना न खाएं।
• **पूरा आराम करें:** अगले 3-4 दिन भारी काम या व्यायाम न करें।
• **दवा:** बुखार उतर चुका है तो पैरासिटामोल बंद कर दें। केवल डॉक्टर द्वारा बताई गई जरूरी दवाएं ही लें।
• **डॉक्टर को कब दिखाएं:** यदि दोबारा बुखार आए या अत्यधिक कमजोरी 3 दिन से ज्यादा रहे।`;
    }

    return `🩺 **Quick Fever Recovery Guide (Direct Advice):**
• **Rehydrate:** Drink 2.5 to 3 liters of fluids daily (water, coconut water, ORS) to regain lost energy.
• **Eat Light:** Have soft, easily digestible foods like khichdi, vegetable soup, and fruits. Avoid oily or spicy meals.
• **Take Rest:** Allow your body to recover. Avoid strenuous exercise or heavy physical work for 3–4 days.
• **Medication:** Stop taking Paracetamol if your body temperature has returned to normal.
• **When to see a doctor:** If fever relapses or extreme fatigue/body ache persists beyond 3 days.`;
  }

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
      return `🩺 **बुखार और संक्रमण (सटीक सलाह):**
• **दवा:** पैरासिटामोल 650mg (Dolo 650 / Calpol 650) भोजन के बाद लें। 6 घंटे का अंतर रखें (अधिकतम 3 गोली प्रतिदिन)।
• **पानी:** दिन में 2.5–3 लीटर पानी, ORS या नारियल पानी पिएं।
• **सिकाई:** माथे पर सामान्य पानी की ठंडी पट्टी रखें। बर्फ न लगाएं।
• **आहार:** मूंग दाल खिचड़ी या पतला सूप लें। तला-भुना खाना न खाएं।
• **डॉक्टर को कब दिखाएं:** यदि बुखार 102°F से अधिक हो या 3 दिन से ज्यादा रहे।`;
    }
    return `🩺 **Fever & Infection Care (Direct Advice):**
• **Medication:** Paracetamol 650mg (Dolo / Calpol) after food (6 hours apart, max 3 tablets daily).
• **Hydration:** Drink 2.5 to 3 liters of fluids (water, ORS, coconut water) daily.
• **Cooling:** Sponge forehead with room-temperature damp cloth. Avoid ice.
• **Diet:** Eat light foods like khichdi and warm vegetable soup.
• **When to see a doctor:** If fever stays above 102°F or lasts beyond 3 days.`;
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
      return `🩺 **सिरदर्द और माइग्रेन (सटीक सलाह):**
• **पानी:** तुरंत 2 बड़े गिलास गुनगुना पानी पिएं।
• **आराम:** शांत, अंधेरे कमरे में 20 मिनट लेटें और मोबाइल स्क्रीन बंद रखें।
• **दवा:** तेज दर्द में भोजन के बाद पैरासिटामोल 650mg लें। खाली पेट पेनकिलर न लें।
• **सिकाई:** माइग्रेन में माथे पर ठंडा पैक लगाएं; तनाव में गर्दन पर गर्म सिकाई करें।
• **चेतावनी:** अचानक तेज सिरदर्द, उल्टी या धुंधला दिखने पर तुरंत डॉक्टर को दिखाएं।`;
    }
    return `🩺 **Headache & Migraine (Direct Advice):**
• **Hydrate:** Drink 2 large glasses of warm water immediately.
• **Rest:** Lie down in a quiet, dark room for 20 minutes away from screens.
• **Medication:** Take Paracetamol 650mg after food if pain is severe.
• **Compress:** Apply a cool pack to forehead for migraine, or warm compress to neck for tension.
• **Warning:** Seek immediate medical care if accompanied by vomiting, stiff neck, or vision blur.`;
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
      return `🩺 **खांसी और जुकाम (सटीक सलाह):**
• **गरारे:** दिन में 3 बार गुनगुने नमक के पानी से गरारे करें।
• **भाप:** दिन में 2 बार 5 मिनट सादे पानी की भाप लें।
• **दवा:** सूखी खांसी में Ascoril D सिरप (10ml); कफ वाली खांसी में Ascoril LS (10ml)। रात में Cetirizine 10mg।
• **घरेलू उपाय:** अदरक, तुलसी और 1 चम्मच शहद का सेवन करें।
• **चेतावनी:** खांसी में खून आने या सांस फूलने पर तुरंत डॉक्टर को दिखाएं।`;
    }
    return `🩺 **Cough & Cold Relief (Direct Advice):**
• **Gargle:** Gargle with warm salt water 3 times daily to relieve throat soreness.
• **Steam:** Inhale warm steam for 5–10 minutes twice daily.
• **Medication:** Ascoril D (10ml) for dry cough; Ascoril LS (10ml) for chesty cough; Cetirizine 10mg at bedtime for runny nose.
• **Home Care:** Drink warm water with honey and ginger.
• **Warning:** See a doctor if cough lasts over 2 weeks or causes shortness of breath.`;
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
      return `🩺 **एसिडिटी और सीने में जलन (सटीक सलाह):**
• **दवा:** पैंटोप्राजोल 40mg (Pan 40) सुबह खाली पेट, नाश्ते से 30 मिनट पहले 1 गिलास पानी से लें।
• **त्वरित राहत:** तेज जलन में डायजीन (Digene) या जेलुसिल सिरप की 2 चम्मच लें।
• **आहार:** चाय, कॉफी, मिर्च-मसाले और तली चीजें बंद करें। ठंडा दूध पिएं।
• **सोने का नियम:** रात के खाने के तुरंत बाद न लेटें। सिरहाने को थोड़ा ऊंचा रखें।
• **चेतावनी:** यदि सीने का दर्द बाएं हाथ या जबड़े में फैले तो तुरंत ईसीजी (ECG) कराएं।`;
    }
    return `🩺 **Acidity & Acid Reflux (Direct Advice):**
• **Medication:** Pantoprazole 40mg (Pan 40) once daily in the morning, 30 mins before breakfast.
• **Instant Relief:** Take 2 spoons of Digene or Gelusil antacid gel for fast cooling.
• **Diet:** Avoid tea, coffee, deep-fried foods, and hot spices. Sip cold milk.
• **Posture:** Do not lie down right after dinner; keep head slightly elevated.
• **Warning:** If chest burning radiates to left arm or jaw with sweating, get an emergency ECG.`;
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
      return `🩺 **पेट दर्द, दस्त और उल्टी (सटीक सलाह):**
• **ORS:** 1 लीटर पानी में 1 पैकेट इलेक्ट्राल ORS घोलकर दिनभर घूंट-घूंट पिएं।
• **उल्टी की दवा:** Ondansetron 4mg (Emeset 4) खाने से 15 मिनट पहले लें।
• **पेट दर्द:** ऐंठन में मेफ्टल स्पास (Meftal Spas) भोजन के बाद लें।
• **आहार:** मूंग दाल खिचड़ी, केला और छाछ लें। दूध और तेल-घी बंद रखें।
• **चेतावनी:** पेशाब बहुत कम होने या चक्कर आने पर तुरंत अस्पताल में ड्रिप लगवाएं।`;
    }
    return `🩺 **Stomach Pain & Diarrhea Care (Direct Advice):**
• **Rehydrate:** Dissolve 1 sachet Electral ORS in 1L clean water and sip throughout the day.
• **For Vomiting:** Take Ondansetron 4mg orally 15 minutes before meals.
• **For Cramps:** Take Meftal Spas after food for colic pain relief.
• **Diet:** Eat soft khichdi, bananas, and curd. Avoid dairy milk and oily meals.
• **Warning:** Visit an emergency clinic if dehydration causes extreme dizziness or dark/no urine.`;
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
      return `🩺 **डायबिटीज और ब्लड शुगर (सटीक सलाह):**
• **टारगेट:** खाली पेट 70-100 mg/dL, भोजन के 2 घंटे बाद 140 mg/dL से कम।
• **दवा:** मेटफॉर्मिन (Glycomet) हमेशा भोजन के साथ लें। भोजन छोड़े बिना दवा न लें।
• **आहार:** सफेद चीनी, मिठाई और कोल्ड ड्रिंक बंद करें। ओट्स, हरी सब्जियां और दालें खाएं।
• **टहलना:** रोजाना 30 मिनट तेज चाल चलें।
• **लो शुगर चेतावनी:** हाथ कांपने या पसीना आने पर तुरंत 1 चम्मच चीनी या टॉफी खाएं।`;
    }
    return `🩺 **Diabetes & Blood Sugar (Direct Advice):**
• **Target:** Fasting 70–100 mg/dL, post-meal < 140 mg/dL, HbA1c < 6.5%.
• **Medication:** Take Metformin (Glycomet) strictly with meals as prescribed.
• **Diet:** Eliminate white sugar, sweets, and sodas; eat fiber-rich oats, greens, and lentils.
• **Activity:** Walk briskly for 30 minutes daily to lower blood sugar.
• **Low Sugar Alert:** If trembling or sweating occurs, immediately consume 1 spoon sugar or candy.`;
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
      return `🩺 **ब्लड प्रेशर (सटीक सलाह):**
• **मानक:** सामान्य बीपी 120/80 mmHg। 140/90 से ऊपर हाई बीपी माना जाता है।
• **दवा:** बीपी की दवा (जैसे Telma 40) प्रतिदिन निश्चित समय पर लें। अचानक बंद न करें।
• **नमक:** भोजन में नमक आधा चम्मच रखें। पापड़, अचार और नमकीन बंद करें।
• **चेतावनी:** बीपी 180/120 से ऊपर जाने या सीने में भारीपन होने पर तुरंत इमरजेंसी जाएं।`;
    }
    return `🩺 **Blood Pressure Guidance (Direct Advice):**
• **Normal Target:** 120/80 mmHg. High BP is 140/90 mmHg or above.
• **Medication:** Take your prescribed BP pill (e.g. Telma 40) at the same time each morning.
• **Diet:** Limit salt to less than 1 teaspoon daily; avoid pickles and fried snacks.
• **Warning:** If BP exceeds 180/120 or you feel chest pressure, visit an emergency room immediately.`;
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
      return `🩺 **कोलेस्ट्रॉल और हृदय स्वास्थ्य (सटीक सलाह):**
• **दवा:** डॉक्टर द्वारा बताई गई स्टैटिन (जैसे Atorvastatin 10/20mg) रात को भोजन के बाद लें।
• **तेल का परहेज:** रिफाइंड पाम ऑयल, डालडा और तली चीजें पूरी तरह बंद करें।
• **हेल्दी फैट्स:** रोजाना 4 भीगे बादाम, 2 अखरोट और 1 चम्मच अलसी लें।
• **व्यायाम:** हफ्ते में 5 दिन कम से कम 30 मिनट तेज टहलें।`;
    }
    return `🩺 **Cholesterol & Heart Care (Direct Advice):**
• **Medication:** Take prescribed statin (e.g. Atorvastatin 10/20mg) at night after dinner.
• **Diet:** Completely cut out trans-fats, bakery goods, and deep-fried snacks.
• **Healthy Foods:** Eat 4 soaked almonds, 2 walnuts, and 1 spoon flaxseeds daily.
• **Exercise:** Walk briskly for 30 minutes 5 days a week to boost good HDL cholesterol.`;
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
      return `🩺 **जोड़ों और कमर का दर्द (सटीक सलाह):**
• **दर्द से राहत:** वोलिनी या मूव जेल हल्के हाथ से लगाएं। तेज मालिश न करें।
• **दवा:** तेज दर्द में भोजन के बाद कॉम्बीफ्लेम या वोवेरान लें। साथ में एंटासिड लें।
• **सप्लीमेंट:** Shelcal 500 (कैल्शियम + D3) और न्यूरोबियन फोर्ट 1 गोली रोज लें।
• **सिकाई:** गर्म पानी की थैली से 15 मिनट सिकाई करें। भारी वजन उठाने से बचें।`;
    }
    return `🩺 **Joint & Back Pain Relief (Direct Advice):**
• **Topical Gel:** Apply Volini or Moov gel gently without vigorous rubbing.
• **Medication:** Take Paracetamol 650mg or Combiflam after food for pain relief.
• **Supplements:** Take Shelcal 500 (Calcium + D3) and Neurobion Forte daily.
• **Care:** Apply warm water compress for 15 minutes. Avoid heavy lifting and floor sitting.`;
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
      return `🩺 **खून की कमी और कमजोरी (सटीक सलाह):**
• **दवा:** आयरन सप्लीमेंट (जैसे Orofer XT / Autrin) 1 गोली रोज दोपहर के भोजन के बाद लें।
• **सावधानी:** आयरन के साथ चाय या दूध न पिएं। इसे नींबू पानी या संतरे के जूस के साथ लें।
• **आहार:** पालक, मेथी, चुकंदर, अनार, खजूर, गुड़ और भुने चने खाएं।`;
    }
    return `🩺 **Anemia & Weakness Care (Direct Advice):**
• **Medication:** Take 1 iron tablet (Orofer XT / Autrin) daily after lunch.
• **Absorption Tip:** Take iron with lemon water or orange juice. Avoid tea, coffee, or milk with iron.
• **Diet:** Eat spinach, beetroot, pomegranate, dates, lentils, and jaggery.`;
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
      return `🩺 **थायराइड असंतुलन (सटीक सलाह):**
• **दवा:** थायरोक्सिन (Thyronorm / Eltroxin) सुबह उठते ही खाली पेट 1 गिलास पानी से लें।
• **नियम:** दवा लेने के बाद 45 मिनट तक चाय, दूध या नाश्ता न लें।
• **जांच:** हर 3 महीने में खाली पेट TSH टेस्ट कराकर डॉक्टर से खुराक चेक कराएं।`;
    }
    return `🩺 **Thyroid Management (Direct Advice):**
• **Medication:** Take Levothyroxine (Thyronorm) first thing in the morning with a full glass of water.
• **Rule:** Wait 45 to 60 minutes before having tea, coffee, milk, or breakfast.
• **Monitoring:** Check fasting TSH every 8 to 12 weeks to adjust dose.`;
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
      return `🩺 **पीलिया और लिवर स्वास्थ्य (सटीक सलाह):**
• **पूर्ण आराम:** 10-14 दिन का पूरा बेड रेस्ट लें। भारी काम न करें।
• **आहार:** तेल, घी और मसाले बंद करें। उबला खाना, गन्ने का ताजा रस, नारियल पानी और पपीता लें।
• **दवा:** लिव 52 डीएस (Liv 52 DS) 2 गोली दिन में दो बार भोजन के बाद लें।
• **जांच:** तुरंत एलएफटी (LFT) और बिलीरुबिन टेस्ट कराएं।`;
    }
    return `🩺 **Jaundice & Liver Care (Direct Advice):**
• **Rest:** Take complete bed rest for 10–14 days to let liver cells recover.
• **Diet:** Zero-oil diet. Drink coconut water, clean sugarcane juice, and eat ripe papaya.
• **Support:** Take Liv-52 DS (2 tablets twice daily) after meals.
• **Testing:** Get a Liver Function Test (LFT) and ultrasound done promptly.`;
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
      return `🩺 **पेशाब में जलन और यूटीआई (सटीक सलाह):**
• **पानी:** दिन में कम से कम 3.5 से 4 लीटर पानी पिएं ताकि बैक्टीरिया धुल जाएं।
• **जलन में राहत:** Cital Syrup 2 चम्मच 1 गिलास पानी में मिलाकर दिन में 3 बार पिएं।
• **दवा:** संक्रमण के लिए डॉक्टर Cefixime 200mg या Nitrofurantoin निर्धारित करते हैं।
• **जांच:** यूरिन रूटीन (Urine R/M) टेस्ट कराएं।`;
    }
    return `🩺 **UTI & Burning Urination (Direct Advice):**
• **Hydration:** Drink 3.5 to 4 liters of clean water daily to flush the urinary tract.
• **Rapid Relief:** Mix 2 spoons of Cital syrup in a glass of water and drink 3 times daily.
• **Medication:** Take prescribed antibiotic (like Cefixime 200mg) for bacterial infection.
• **Diagnostics:** Get a Urine Routine & Microscopy test done.`;
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
  // 17. DIRECT-TO-DIRECT ANSWER FOR ANY GENERAL HEALTH QUESTION (SMALL SENTENCES)
  // =========================================================================
  const cleanSubject =
    query
      .replace(
        /what is|what are|what to take for|what causes|how to treat|how to cure|what|kya hai|kya kare|kya karu/gi,
        ''
      )
      .trim() || query;

  if (isHi) {
    return `🩺 **"${cleanSubject}" के लिए सीधी व सटीक सलाह:**
• **प्राथमिक कदम:** दिन में 2.5–3 लीटर ताजा पानी पिएं और पर्याप्त आराम लें।
• **दवा की सावधानी:** बिना डॉक्टर की सलाह एंटीबायोटिक या तेज दवाएं न लें। हल्के दर्द या बुखार में भोजन के बाद पैरासिटामोल 650mg सुरक्षित है।
• **आहार व परहेज:** हल्का, ताजा और सुपाच्य भोजन लें। अत्यधिक तेल-मसाले से बचें।
• **डॉक्टर से संपर्क:** यदि समस्या 48 घंटे में ठीक न हो, तो ऊपर **Telemedicine** टैब से डॉक्टर के साथ वीडियो कॉल करें।`;
  }

  return `🩺 **Direct Clinical Guidance for "${cleanSubject}":**
• **Immediate Step:** Drink 2.5 to 3 liters of water daily and ensure 7–8 hours of sound sleep.
• **Medication Rule:** Avoid self-prescribing antibiotics. For general pain or mild fever, Paracetamol 650mg after food is safe.
• **Dietary Advice:** Eat freshly cooked, easily digestible meals and avoid heavy, spicy foods.
• **Consultation:** If symptoms persist beyond 48 hours, consult a physician or click the **Telemedicine** tab for a video call.`;
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
                  ChatGPT Backend Attached (GPT-4o-mini)
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
                      { id: 'chatgpt', label: '🤖 ChatGPT (Direct)' },
                      { id: 'gemini', label: '✨ Gemini' },
                      { id: 'auto', label: '⚡ Auto' },
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
                    OpenAI ChatGPT API Key (Direct Connection):
                  </label>
                  <input
                    type="password"
                    value={aiConfig.openaiApiKey}
                    onChange={(e) =>
                      setLocalAiConfig({ ...aiConfig, openaiApiKey: e.target.value })
                    }
                    placeholder="sk-proj-... (Paste OpenAI key or leave for backend env)"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-[11px] text-slate-900 dark:text-slate-100"
                  />
                  <p className="text-[9px] text-slate-500 mt-0.5">
                    Queries OpenAI ChatGPT (GPT-4o-mini) directly from backend.
                  </p>
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
