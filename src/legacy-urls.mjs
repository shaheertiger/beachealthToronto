// Every URL from the old Yoast sitemaps on beachealth.com (posts, pages, team, categories).
// The build guarantees each one resolves: a native page, an imported WordPress page,
// or (until content is imported) an instant redirect to the closest relevant page.

const list = (s) => s.trim().split(/\s+/);

export const legacy = {
  post: list(`
/concussion/ /arthritis-osteo-or-rheumatoid/ /the-nervous-system/ /movement-breaks/ /spondylolisthesis/
/knee-osteoarthritis/ /imaging-and-low-back-pain/ /gluteal-tendinopathy/ /connective-tissue-disease/ /athletes-foot/
/facet-lock/ /vertigo/ /winging-of-the-shoulder-blades/ /prevention-of-running-injuries/ /pilates-with-jen-ingram/
/pandemic-posture/ /dorsal-scapular-nerve-entrapment/ /exercises-for-ageing-bones/ /dead-butt-syndrome/ /plantar-fasciitis-2/
/chronic-inflammation/ /calluses/ /de-quervains-tenosynovitis/ /compression-stockings/ /concussions-and-our-kids-in-sports/
/ankle-sprains/ /numbness-and-tingling/ /ice-or-heat/ /visceral-manipulation/ /is-the-empty-can-test-a-good-rehab-exercise/
/swift-treatment-for-warts/ /cranial-osteopathy-and-cranio-sacral-therapy/ /pregnancy-and-osteopathy/ /foam-rolling/
/plantar-fasciitis/ /achilles-tendinitis/ /tennis-elbow/ /10-tips-to-get-ready-for-summer-activity/ /proper-posture-at-your-office/
/osteoarthritis/ /shin-splints/ /tmj/ /rotator-cuff-injury/ /sacroiliac-joint-pain/ /back-to-work-desk-tips-to-remember/
/medial-epicondylitis-golfers-elbow/ /getting-your-bike-setup-correctly/ /most-common-basketball-injuries/
/headaches-migraines-treatment-and-prevention/ /orthotics/ /self-care-isnt-selfish/ /calf-muscle-strain/ /osteopathy-for-neck-pain/
/have-you-tried-pilates/ /exercise-for-osteoporosis/ /osteopathic-treatment-for-arthritis/ /what-is-diabetes/ /rsi/
/mobilizing-your-joints/ /diaphragm-function/ /are-your-joints-popping-grinding-or-clicking/ /medical-pedicures-by-a-chiropodist/
/lumbar-disc-prolapse/ /new-facial-spa-services-and-microneedling/ /bunions/ /diabetes-and-foot-care/
/venous-insufficiency-aching-swelling-and-spider-veins/ /medial-ankle-sprain/ /boost-your-balance-and-embrace-stability/
/carpal-tunnel-symdrome/ /get-ahead-of-the-school-year/ /your-first-osteopathy-appointment/ /laser-season-is-here/
/all-about-quadricep-strains/ /ingrown-toenails/ /all-about-osteoporosis/ /office-worker-elbow/
/inflammation-and-the-connection-to-your-immune-system/ /hip-osteoarthritis/ /plantar-warts/
/stress-fractures-how-a-chiropodist-can-help/ /subacromial-impingement-an-osteopathic-perspective/
/turning-resolutions-into-reality-insights-from-your-osteopath/ /osteopathy-for-musicians/
/dry-or-cracked-feet-how-a-chiropodist-can-help/ /type-2-diabetes-and-osteopathic-care/
/lymphatic-drainage-massage-a-comprehensive-guide/ /understanding-respiratory-syncytial-virus-rsv/
/introducing-our-new-chiropodist/ /juvenile-idiopathic-scoliosis-a-comprehensive-guide/
/all-about-disc-injuries-an-osteopaths-perspective/ /increase-shoulder-stability-through-exercise/
/why-are-my-joints-so-noisy-an-osteopaths-view/ /how-osteopathy-can-help-you-recover-after-a-fracture/
/successful-treatment-for-warts/ /tackling-twisted-knees/ /understanding-cervical-kyphosis/
/understanding-dequervains-tenosynovitis/ /what-is-swift-wart-removal/ /been-told-you-need-a-hip-replacement/
/heart-health-all-about-your-cardiovascular-system/ /understanding-intercostal-muscle-strain/
/how-are-your-new-years-goals-going-psst-its-not-too-late/ /osteopathy-its-not-just-about-cracking/
/radio-frequency-rf-aesthetics-treatments/ /shin-splints-2/
/all-about-arthritis-understanding-the-aches-and-how-osteopathy-can-help/ /all-about-muscle-strains/
/tarsal-tunnel-syndrome/ /planning-for-the-year-ahead/ /to-my-valued-clients/ /understanding-scaphoid-fractures/
/what-are-antioxidants-and-how-can-i-get-them-into-my-diet/ /the-sesamoid-bones/
/how-to-support-a-loved-one-with-dementia/ /reducing-the-risk-of-falls-as-we-age-steady-steps/ /get-to-know-our-rmts/
/from-frustration-to-recovery-a-smarter-approach-to-tendon-pain/ /the-aging-shoulder/ /dry-needling-explained/
`),
  team: list(`
/team/dale-jones/ /team/emily-tran/ /team/patrice-wilson/ /team/jared-cox/ /team/emily-tran-2/
/team/lada-milos-lee/ /team/dradambletsoe/ /team/jake-maher/ /team/krystele-charles/
`),
  category: list(`
/category/acupuncture/ /category/aesthetics/ /category/back-pain/ /category/chiropody/ /category/exercise/
/category/fitness/ /category/foot-pain/ /category/foot-problems/ /category/fractures/ /category/health/
/category/osteopathy/hip-pain/ /category/osteopathy/joint-pain-osteopathy/ /category/joint-pain/
/category/massage-therapy/ /category/naturopathy/ /category/nerve-related-injuries/ /category/nutrition/
/category/osteopathy/ /category/posture/ /category/pregnancy/ /category/respiratory-issues/
/category/running-injuries/ /category/osteopathy/shoulder/ /category/sports-injuries/ /category/tendon-injury/
/category/uncategorized/ /category/visceral-pain/
`),
  page: list(`
/ /location/ /login-customizer/ /osteopathy-toronto/ /osteopath-toronto/ /running-clinic/
/services/osteopathy/patella-tendinopathy/ /services/osteopathy/postural-problems/
/services/osteopathy/scans-common-questions/ /services/osteopathy/sciatica/ /services/osteopathy/sports-injuries/
/services/osteopathy/why-osteopathy/ /sports-injuries/ /sports-injuries/running-injury-program/ /admin-page-changed/
/privacy-policy/ /job-opportunities/ /blog/ /https-beachealth-com-team-emily-tran/ /pilates-physiotherapist/
/registered-massage-therapist/ /services/aesthetics/spider-veins-varicose-veins/ /services/chiropody/
/services/chiropody/medical-pedicure/ /services/chiropody/orthotics/ /services/naturopathy/
/services/osteopathy/back-pain/ /services/osteopathy/disc-prolapse/ /services/osteopathy/headaches/
/services/osteopathy/neck-pain/ /services/osteopathy/osteopathy-for-lower-back-pain/ /services/pilates/
/services/acupuncture/ /services/aesthetics/ /book-appointment/ /contact/ /services/massage-therapy/ /about/
/services/tmj-massage/ /services/running-analysis/ /services/shockwave-therapy/ /services/chiropractic/
/services/ /services/physio-pilates/ /services/osteopathy/
`)
};

// Explicit fallbacks for pages; everything else is matched by keyword below.
const explicit = {
  "/location/": "/contact/",
  "/login-customizer/": "/",
  "/admin-page-changed/": "/",
  "/osteopathy-toronto/": "/services/osteopathy/",
  "/osteopath-toronto/": "/services/osteopathy/",
  "/running-clinic/": "/services/running-analysis/",
  "/sports-injuries/": "/services/",
  "/sports-injuries/running-injury-program/": "/services/running-analysis/",
  "/privacy-policy/": "/contact/",
  "/job-opportunities/": "/about/",
  "/blog/": "/",
  "/https-beachealth-com-team-emily-tran/": "/team/emily-tran/",
  "/pilates-physiotherapist/": "/services/physio-pilates/",
  "/registered-massage-therapist/": "/services/massage-therapy/",
  "/services/pilates/": "/services/physio-pilates/",
  "/services/tmj-massage/": "/services/massage-therapy/",
  "/orthotics/": "/services/chiropody/orthotics/",
  "/medical-pedicures-by-a-chiropodist/": "/services/chiropody/medical-pedicure/",
  "/dry-needling-explained/": "/services/dry-needling/",
  "/get-to-know-our-rmts/": "/services/massage-therapy/"
};

const rules = [
  [/orthotic/, "/services/chiropody/orthotics/"],
  [/pedicure/, "/services/chiropody/medical-pedicure/"],
  [/run|shin-splint|basketball|bike/, "/services/running-analysis/"],
  [/pilates|balance|stability/, "/services/physio-pilates/"],
  [/massage|rmt|lymphatic/, "/services/massage-therapy/"],
  [/needling/, "/services/dry-needling/"],
  [/shockwave|tendin|tendon|tennis-elbow|golfers-elbow|epicondyl/, "/services/shockwave-therapy/"],
  [/chiropract/, "/services/chiropractic/"],
  [/chiropod|foot|feet|toe|wart|callus|bunion|plantar|athletes|sesamoid|tarsal|stress-fracture|diabet|compression|venous|ankle/, "/services/chiropody/"],
  [/^\/team\//, "/team/"],
  [/aesthetic|facial|laser|naturopath|acupunct|antioxidant|nutrition|respiratory|rsv|heart|dementia|valued-clients|planning|resolutions|goals|self-care|uncategorized|health/, "/services/"]
];

export function fallbackFor(path) {
  if (explicit[path]) return explicit[path];
  for (const [re, to] of rules) if (re.test(path)) return to;
  return "/services/osteopathy/"; // most of the old articles were written by the clinic's osteopaths
}
