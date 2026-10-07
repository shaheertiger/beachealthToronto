// Clinic facts used across every page, the JSON-LD, llms.txt and the sitemaps.
// Keep this file accurate: AI answer engines and Google quote these values directly.
// Verify the hours below against what the front desk actually works before launch.

export default {
  name: "Beach Health",
  legalName: "Beach Health",
  tagline: "Multidisciplinary health clinic in the Beaches, Toronto",
  // Production origin. Pages are only indexable when the site is served from here.
  siteUrl: "https://beachealth.com",
  phone: "(416) 546-4887",
  phoneE164: "+14165464887",
  email: "info@beachealth.com",
  bookingUrl: "https://beachealth.janeapp.com/",
  address: {
    street: "350 Beech Ave",
    locality: "Toronto",
    region: "ON",
    postalCode: "", // add the postal code here — it strengthens local SEO
    country: "CA",
    neighbourhood: "The Beaches",
    directions: "At Kingston Road and Beech Avenue, in Toronto's east end."
  },
  // Optional: decimal latitude/longitude of the clinic door, e.g. { lat: 43.68, lng: -79.29 }
  geo: null,
  mapUrl: "https://www.google.com/maps/search/?api=1&query=Beach+Health+350+Beech+Ave+Toronto+ON",
  hours: [
    // [schema.org day, label, opens, closes] — null opens means closed
    ["Monday", "Mon", "10:00", "19:00"],
    ["Tuesday", "Tue", "09:30", "19:00"],
    ["Wednesday", "Wed", "08:00", "18:30"],
    ["Thursday", "Thu", "09:00", "18:00"],
    ["Friday", "Fri", "09:00", "18:00"],
    ["Saturday", "Sat", "09:00", "15:00"],
    ["Sunday", "Sun", null, null]
  ],
  areaServed: ["The Beaches", "the Danforth", "Scarborough", "East Toronto"],
  // Official profiles (Google Business Profile, Instagram, Facebook, etc.).
  // These become schema.org sameAs links, which help search and AI engines tie the clinic together.
  sameAs: ["https://beachealth.janeapp.com/"],
  // Optional photos (paths under public/, e.g. "/assets/photos/hero.jpg"). Wave artwork is shown until set.
  // Individual services also accept an `image` field in src/content.mjs.
  heroImage: null,
  teamImage: null,
  clinicImage: null,
  locale: "en-CA",
  themeColor: "#0877b8"
};
