// Page content. Services keep the URLs they already rank under on beachealth.com.

// Bump when the clinical content below is reviewed; used for dateModified / lastmod.
export const updated = "2026-10-07";

export const groups = ["Manual therapy", "Foot care", "Movement & recovery"];

export const services = [
  {
    name: "Osteopathy", path: "/services/osteopathy/", group: "Manual therapy", practitioner: "osteopath",
    related: ["Chiropractic", "Massage Therapy"],
    short: "Hands-on treatment that works on the link between the body's structure and how it functions.",
    intro: "Osteopathy is a form of manual medicine, which recognizes the important link between the structure of the body and the way it functions. Osteopaths assess muscles, joints, ligaments and connective tissue together, then use gentle hands-on techniques to ease pain and improve movement.",
    helps: ["Back and neck pain", "Headaches from tension", "Joint stiffness", "Sports injuries", "Postural strain", "Sciatica"],
    expect: ["Your first appointment starts with a conversation about your symptoms, health history and daily routine, followed by an assessment of posture and movement.", "Treatment may include soft tissue work, joint mobilization, stretching and manipulation. You'll leave with advice and exercises to support recovery between visits."],
    faqs: [
      ["What should I wear to an osteopathy appointment?", "Wear comfortable, loose clothing you can move in, such as athletic wear or shorts, because your osteopath will assess how you move as well as where it hurts."],
      ["Is osteopathy the same as chiropractic?", "Both are hands-on and treat joints and muscles. Osteopathy usually takes a whole-body approach using gentle soft tissue and joint techniques, while chiropractic focuses more on the spine and joints and often uses adjustments. At Beach Health the two disciplines work side by side and refer to each other."]
    ]
  },
  {
    name: "Chiropody", path: "/services/chiropody/", group: "Foot care", practitioner: "chiropodist",
    related: ["Medical Pedicure", "Custom Foot Orthotics"],
    short: "Assessment and treatment of the feet and lower limbs by a foot specialist.",
    intro: "A chiropodist is a primary health care provider, described as a foot specialist, who provides a variety of medical treatments for the feet and lower limbs. Chiropodists assess, diagnose and treat conditions of the skin, nails and structure of the foot.",
    helps: ["Ingrown toenails", "Corns and calluses", "Fungal nails", "Heel pain", "Diabetic foot care", "Warts"],
    expect: ["The chiropodist will examine your feet, footwear and walking pattern and ask about any pain or changes you've noticed.", "Many concerns are treated in the same visit. If a structural issue is found, they may recommend orthotics or refer you to another practitioner in the clinic."],
    faqs: [
      ["What is the difference between a chiropodist and a podiatrist in Ontario?", "Both are foot specialists regulated by the College of Chiropodists of Ontario. Most foot specialists in Ontario are chiropodists, who assess and treat conditions of the skin, nails and structure of the feet and lower limbs."],
      ["Can a chiropodist treat an ingrown toenail?", "Yes. Ingrown toenails are one of the most common reasons people see a chiropodist. Many are treated in the clinic, and your chiropodist will explain the options if the problem keeps coming back."]
    ]
  },
  {
    name: "Massage Therapy", path: "/services/massage-therapy/", group: "Manual therapy", practitioner: "registered massage therapist (RMT)",
    related: ["Osteopathy", "Dry Needling"],
    short: "Soft tissue and joint work to relieve tension, aid recovery and keep you moving.",
    intro: "Massage therapy is the manipulation of the soft tissues and joints of the body to prevent, develop, maintain, rehabilitate or augment physical function. It is used to relieve muscle tension, reduce pain, support recovery from injury and help manage stress.",
    helps: ["Muscle tension", "Stress", "Sports recovery", "Chronic pain", "Reduced range of motion", "Pregnancy discomfort"],
    expect: ["Your therapist will ask about areas of concern and adjust pressure and technique to suit you. Let them know at any point if something feels uncomfortable.", "Sessions may combine relaxation and therapeutic techniques. Drinking water and gentle movement afterwards helps your muscles settle."],
    faqs: [
      ["What is an RMT?", "A Registered Massage Therapist (RMT) is a massage therapist registered with the College of Massage Therapists of Ontario. Many extended health benefit plans require treatment by an RMT before they reimburse massage therapy."],
      ["Do I have to undress for a massage?", "Only to your comfort level. You stay covered with a sheet and only the area being treated is uncovered. You can also keep on loose, comfortable clothing."]
    ]
  },
  {
    name: "Physio Pilates", path: "/services/physio-pilates/", group: "Movement & recovery", practitioner: "physiotherapist",
    related: ["Osteopathy", "Running Analysis"],
    short: "Physiotherapist-led Pilates that rebuilds strength, control and confidence in movement.",
    intro: "Physiotherapy is an evidence-based practice dedicated to restoring optimal movement and functional capacity for people experiencing injury, chronic illness, pain, or mobility deficits. Physio Pilates combines that clinical approach with Pilates exercises to build core strength, stability and control.",
    helps: ["Rehabilitation after injury", "Lower back pain", "Post-surgery recovery", "Core weakness", "Balance and posture", "Postnatal recovery"],
    expect: ["You'll start with an assessment so your program matches your goals and any injury or condition.", "Sessions use mat and equipment-based exercises, progressed gradually as your strength and control improve. You'll also get exercises to practise at home."],
    faqs: [
      ["Do I need Pilates experience?", "No. Sessions start from your current level and progress as your strength and control improve. Your first session includes an assessment so the exercises suit any injury or condition."],
      ["How is Physio Pilates different from a regular Pilates class?", "It is led by a physiotherapist and built around an assessment of your injury, condition or goals, so exercises are chosen and progressed for you rather than following a general class plan."]
    ]
  },
  {
    name: "Running Analysis", path: "/services/running-analysis/", group: "Movement & recovery", practitioner: "practitioner",
    related: ["Custom Foot Orthotics", "Physio Pilates"],
    short: "Video assessment of how you run, to reduce injury risk and improve efficiency.",
    intro: "Running analysis uses specialized video technology to assess biomechanics. By filming and reviewing your running in slow motion, we can see how your feet, knees, hips and trunk move and spot patterns linked to pain or injury.",
    helps: ["Recurring running injuries", "Shin splints", "Knee pain when running", "Achilles problems", "Choosing footwear", "Improving efficiency"],
    expect: ["Bring your usual running shoes and kit. You'll run for a short period while being filmed from several angles.", "We'll review the footage with you, explain what we see and recommend changes, which may include drills, strength work, footwear advice or orthotics."],
    faqs: [
      ["What should I bring to a running analysis?", "Bring the running shoes you use most, plus shorts and a fitted top so your movement is easy to see on video."],
      ["Do I need to be injured to book a running analysis?", "No. Many runners book to deal with recurring pain, but others come to run more efficiently, choose footwear or lower their injury risk before training for a race."]
    ]
  },
  {
    name: "Shockwave Therapy", path: "/services/shockwave-therapy/", group: "Movement & recovery", practitioner: "practitioner",
    related: ["Chiropody", "Dry Needling"],
    short: "Non-invasive energy pulses that stimulate healing in stubborn tendon and soft tissue pain.",
    intro: "Shockwave therapy is a non-invasive treatment that involves strong energy pulses that are applied to the affected area. These pulses stimulate blood flow and the body's natural healing response, and are commonly used for long-standing tendon and soft tissue problems.",
    helps: ["Plantar fasciitis", "Achilles tendinopathy", "Tennis and golfer's elbow", "Shoulder tendinopathy", "Calcific tendinitis", "Patellar tendon pain"],
    expect: ["A gel is applied to the skin and a handheld applicator delivers pulses to the area. Sessions are short, usually a few minutes of treatment time.", "It can feel uncomfortable during treatment. A course of several sessions is typical, often combined with exercises."],
    faqs: [
      ["Does shockwave therapy hurt?", "It can feel uncomfortable while the pulses are applied, and the intensity is adjusted to what you can tolerate. Treatment time is short, usually a few minutes."],
      ["How many shockwave sessions will I need?", "A course of several sessions is typical. Your practitioner recommends a plan after assessing the problem, often alongside exercises."]
    ]
  },
  {
    name: "Medical Pedicure", path: "/services/chiropody/medical-pedicure/", group: "Foot care", practitioner: "chiropodist",
    related: ["Chiropody", "Custom Foot Orthotics"],
    short: "A clinical pedicure with full toenail care, carried out by a trained chiropodist.",
    intro: "An aesthetic procedure, a medical pedicure comes with the additional benefits of total toenail care by our trained professional chiropodist, carried out with sterilized instruments in a clinical setting.",
    helps: ["Thickened nails", "Dry or cracked heels", "Calluses", "Nail trimming and shaping", "Routine foot maintenance", "Diabetic foot care"],
    expect: ["The chiropodist will check the health of your skin and nails before starting, so any concerns can be addressed at the same time.", "Treatment includes nail care, removal of hard skin and moisturizing. It's a dry treatment, without soaking, for better hygiene."],
    faqs: [
      ["How is a medical pedicure different from a spa pedicure?", "It is done by a chiropodist in a clinical setting with sterilized instruments, and it is a dry treatment without soaking. The chiropodist also checks the health of your skin and nails while treating them."],
      ["Is a medical pedicure suitable if I have diabetes?", "Yes. Foot care from a chiropodist suits people with diabetes, who need extra attention to skin and nail health. Tell us about any medical conditions when you book."]
    ]
  },
  {
    name: "Custom Foot Orthotics", path: "/services/chiropody/orthotics/", group: "Foot care", practitioner: "chiropodist", plural: true,
    related: ["Chiropody", "Running Analysis"],
    short: "Insoles made for your feet to correct alignment and relieve pain.",
    intro: "Many people come to the clinic complaining of foot pain from conditions such as bunions, hammertoes, flat feet or plantar fasciitis. Custom foot orthotics are insoles made from a mould or scan of your feet to support and realign them, reducing strain on the feet, knees, hips and back.",
    helps: ["Bunions", "Hammertoes", "Flat feet or high arches", "Plantar fasciitis", "Knee and hip pain", "Leg length differences"],
    expect: ["A chiropodist assesses your feet, posture and gait, then takes a mould or scan of each foot.", "Your orthotics are made to measure and fitted at a follow-up visit, with guidance on wearing them in."],
    faqs: [
      ["Will my benefits cover custom orthotics?", "Many extended health plans cover custom orthotics when they are prescribed and dispensed by a qualified foot specialist such as a chiropodist. Requirements vary, so check your plan before your appointment."],
      ["How long does it take to get custom orthotics?", "They are made to measure after your assessment and casting appointment, then fitted at a follow-up visit. The front desk can tell you the current turnaround when you book."]
    ]
  },
  {
    name: "Chiropractic", path: "/services/chiropractic/", group: "Manual therapy", practitioner: "chiropractor",
    related: ["Osteopathy", "Massage Therapy"],
    short: "Care that restores movement where the body has become tight, stiff or stuck.",
    intro: "Chiropractic care helps restore movement where the body has become tight, guarded, stiff, or stuck. Chiropractors focus on the spine and joints, using adjustments and related techniques to reduce pain and help you move freely.",
    helps: ["Back pain", "Neck pain", "Tension headaches", "Stiff joints", "Posture-related pain", "Mid-back tightness"],
    expect: ["Your chiropractor will take a history and assess your spine, joints and movement before treatment.", "Treatment may include spinal adjustments, mobilization and soft tissue work, along with advice and exercises to maintain progress."],
    faqs: [
      ["What does a chiropractic adjustment feel like?", "An adjustment is a quick, controlled movement applied to a joint. You may hear a pop, which is gas releasing from the joint. Your chiropractor explains each technique first and can use gentler options if you prefer."],
      ["Is chiropractic only for back pain?", "No. Back pain is common, but chiropractors also treat neck pain, tension headaches, stiff joints and posture-related pain."]
    ]
  },
  {
    name: "Dry Needling", path: "/services/dry-needling/", group: "Manual therapy", practitioner: "practitioner",
    related: ["Massage Therapy", "Shockwave Therapy"],
    short: "Thin needles placed into tight muscle points to release tension and ease pain.",
    intro: "Dry needling is a treatment modality involving the insertion of a thin filament needle into muscle trigger points. It helps release tight bands of muscle, reduce pain and restore normal movement.",
    helps: ["Muscle knots and trigger points", "Neck and shoulder tension", "Low back pain", "Sports injuries", "Tension headaches", "Restricted movement"],
    expect: ["The practitioner identifies trigger points by touch, then inserts single-use sterile needles. You may feel a brief twitch or ache.", "It is usually combined with other hands-on treatment or exercise. Mild soreness for a day or so afterwards is normal."],
    faqs: [
      ["Is dry needling the same as acupuncture?", "Both use thin needles, but they come from different approaches. Dry needling targets muscle trigger points based on a Western anatomical assessment, while acupuncture is rooted in traditional Chinese medicine."],
      ["Does dry needling hurt?", "Most people feel little from the needle itself. You may feel a brief twitch or ache as a trigger point releases, and mild soreness for a day or so afterwards is normal."]
    ]
  }
].map((s, i) => ({ ...s, num: String(i + 1).padStart(2, "0"), id: s.path.split("/").filter(Boolean).pop() }));

export const steps = [
  ["Book", "Book online or by phone. If you're unsure which service you need, tell us your symptoms and we'll advise."],
  ["Assessment", "Your practitioner takes a full history and examines how you move, so treatment is based on the cause, not only the symptom."],
  ["Treatment plan", "You'll get treatment on the day where appropriate, a clear plan for next steps, and exercises or advice to use at home."]
];

export const values = [
  ["Assessment first", "Every new patient gets a thorough assessment before treatment, so the plan fits the cause of the problem."],
  ["Shared care", "Practitioners refer between disciplines when another treatment will help, keeping your care in one place."],
  ["Active recovery", "We explain what's going on and give you exercises and advice, so progress continues between appointments."]
];

// Shown on the team page until practitioner profiles are imported from WordPress.
export const disciplines = [
  ["Osteopath", ["Osteopathy"]],
  ["Chiropodist", ["Chiropody", "Medical Pedicure", "Custom Foot Orthotics"]],
  ["Chiropractor", ["Chiropractic", "Shockwave Therapy"]],
  ["Physiotherapist", ["Physio Pilates", "Running Analysis", "Dry Needling"]],
  ["Registered Massage Therapist", ["Massage Therapy"]]
];

// Clinic-wide questions. Written to be quoted verbatim by AI answer engines, so each answer stands alone.
export const clinicFaqs = (c) => [
  ["Where is Beach Health located?", `Beach Health is at ${c.address.street}, ${c.address.locality}, ${c.address.region}, in Toronto's Beaches neighbourhood. ${c.address.directions}`],
  ["What services does Beach Health offer?", "Osteopathy, chiropractic, chiropody, massage therapy, physio Pilates, dry needling, shockwave therapy, running analysis, medical pedicures and custom foot orthotics, all in one clinic."],
  ["How do I book an appointment at Beach Health?", `Book online any time at ${c.bookingUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")}, or call ${c.phone} during clinic hours.`],
  ["Do I need a doctor's referral?", "No referral is needed to book. Some extended health plans ask for a doctor's note before they reimburse certain treatments, so check your plan."],
  ["Are treatments covered by insurance?", "These services are generally not covered by OHIP, but many extended health benefit plans cover them when a registered practitioner provides the care. Coverage varies, so check your plan before your visit."],
  ["Which areas does Beach Health serve?", `Patients come from ${c.areaServed.slice(0, -1).join(", ")} and the rest of east Toronto.`]
];
