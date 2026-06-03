const demoVideos = [
  {
    durationLabel: "16 min demo",
    durationSeconds: 966,
    videoUrl: "https://archive.org/download/Popeye_meetsSinbadtheSailor/Popeye_meetsSinbadtheSailor_512kb.mp4"
  },
  {
    durationLabel: "17 min demo",
    durationSeconds: 1018,
    videoUrl: "https://archive.org/download/PopeyeAliBaba/PopeyeAliBaba_512kb.mp4"
  },
  {
    durationLabel: "15 min demo",
    durationSeconds: 888,
    videoUrl: "https://archive.org/download/Sintel/sintel-2048-stereo.mp4"
  },
  {
    durationLabel: "20 min demo",
    durationSeconds: 1172,
    videoUrl: "https://archive.org/download/openlibrary-tour-2020/openlibrary-book-imports-2018.mp4"
  },
  {
    durationLabel: "17 min demo",
    durationSeconds: 1049,
    videoUrl: "https://archive.org/download/b-ss-14-e-20/%28B%29SS14E44.mp4"
  }
];

const titles = [
  {
    id: "the-summer-i-turned-pretty",
    title: "The Summer I Turned Pretty",
    provider: "Prime Video",
    language: "English",
    genre: "Romance Drama",
    year: "2022",
    rating: "TV-14",
    synopsis: "A beachside coming-of-age romance entry for a bright, familiar OTT demo catalog.",
    posterUrl: "https://images.justwatch.com/backdrop/284447785/s640/the-summer-i-turned-pretty.jpg"
  },
  {
    id: "scam-1992",
    title: "Scam 1992",
    provider: "Sony LIV",
    language: "Hindi",
    genre: "Financial Drama",
    year: "2020",
    rating: "TV-14",
    synopsis: "A sharp market-crime drama title that gives the catalog a premium Indian streaming feel.",
    posterUrl: "https://images.justwatch.com/backdrop/260494796/s640/scam-1992-the-harshad-mehta-story.jpg"
  },
  {
    id: "permanent-roommates",
    title: "Permanent Roommates",
    provider: "Prime Video",
    language: "Hindi",
    genre: "Romantic Comedy",
    year: "2014",
    rating: "U/A 13+",
    synopsis: "A modern relationship comedy title for a light watch-party mood.",
    posterUrl: "https://images.justwatch.com/backdrop/309385870/s640/permanent-roommates.jpg"
  },
  {
    id: "pati-patni-aur-woh-do",
    title: "Pati Patni Aur Woh Do",
    provider: "JioHotstar",
    language: "Hindi",
    genre: "Comedy",
    year: "2025",
    rating: "U/A 13+",
    synopsis: "A comedy-drama title card with real poster artwork for the demo shelf.",
    posterUrl: "https://images.justwatch.com/poster/345633546/s718/pati-patni-aur-woh-2.jpg"
  },
  {
    id: "panchayat",
    title: "Panchayat",
    provider: "Prime Video",
    language: "Hindi",
    genre: "Comedy Drama",
    year: "2020",
    rating: "TV-14",
    synopsis: "A warm village-life series entry that keeps the app feeling close to real Indian OTT browsing.",
    posterUrl: "https://images.justwatch.com/backdrop/246950716/s640/panchayat.jpg"
  },
  {
    id: "krishnavataram",
    title: "Krishnavataram",
    provider: "ETV Win",
    language: "Telugu",
    genre: "Mythological Drama",
    year: "2025",
    rating: "U/A 13+",
    synopsis: "A devotional drama entry with real listing artwork for a broader regional catalog feel.",
    posterUrl: "https://images.justwatch.com/poster/345462039/s718/krishnavataram-part-1-the-heart.jpg"
  },
  {
    id: "scary-movie",
    title: "Scary Movie",
    provider: "Lionsgate Play",
    language: "English",
    genre: "Horror Comedy",
    year: "2000",
    rating: "A",
    synopsis: "A horror-comedy movie entry to make the catalog feel varied and playful.",
    posterUrl: "https://images.justwatch.com/backdrop/32386/s640/scary-movie.jpg"
  },
  {
    id: "happy-ending",
    title: "Happy Ending",
    provider: "Eros Now",
    language: "Hindi",
    genre: "Romantic Comedy",
    year: "2014",
    rating: "U/A 13+",
    synopsis: "A glossy rom-com card for lighter demo watch-party sessions.",
    posterUrl: "https://images.justwatch.com/backdrop/258798020/s640/happy-ending.jpg"
  },
  {
    id: "gullak-5",
    title: "Gullak 5",
    provider: "Sony LIV",
    language: "Hindi",
    genre: "Family Comedy",
    year: "2026",
    rating: "U/A 13+",
    synopsis: "A family-series favorite styled as a latest-season shelf item for the demo.",
    posterUrl: "https://images.justwatch.com/backdrop/339149507/s640/gullak.jpg"
  },
  {
    id: "flames",
    title: "Flames",
    provider: "Amazon MX Player",
    language: "Hindi",
    genre: "Teen Romance",
    year: "2018",
    rating: "U/A 13+",
    synopsis: "A young romance series title that adds color and familiarity to the catalog.",
    posterUrl: "https://images.justwatch.com/backdrop/163344875/s640/flames.jpg"
  },
  {
    id: "the-family-man",
    title: "The Family Man",
    provider: "Prime Video",
    language: "Hindi",
    genre: "Action Thriller",
    year: "2019",
    rating: "TV-MA",
    synopsis: "A spy-action title that pairs well with watch-together rooms and reactions.",
    posterUrl: "https://images.justwatch.com/backdrop/302895294/s640/the-family-man.jpg"
  },
  {
    id: "rail",
    title: "Rail",
    provider: "SunNXT",
    language: "Tamil",
    genre: "Drama",
    year: "2024",
    rating: "U/A 13+",
    synopsis: "A railway-themed regional drama entry for a broader OTT demo lineup.",
    posterUrl: "https://images.justwatch.com/poster/209543496/s718/.jpg"
  },
  {
    id: "aspirants",
    title: "Aspirants",
    provider: "TVF Play",
    language: "Hindi",
    genre: "Drama",
    year: "2021",
    rating: "U/A 13+",
    synopsis: "A student-life drama title that gives the catalog a popular web-series feel.",
    posterUrl: "https://images.justwatch.com/backdrop/341988268/s640/aspirants.jpg"
  },
  {
    id: "chand-mera-dil",
    title: "Chand Mera Dil",
    provider: "Theatrical / OTT",
    language: "Hindi",
    genre: "Romance",
    year: "2025",
    rating: "U/A 13+",
    synopsis: "A romance title card for a fresh Bollywood-style demo section.",
    posterUrl: "https://images.justwatch.com/backdrop/344278351/s640/chand-mera-dil.jpg"
  },
  {
    id: "drifting-home",
    title: "Drifting Home",
    provider: "Netflix",
    language: "Japanese",
    genre: "Anime Adventure",
    year: "2022",
    rating: "PG",
    synopsis: "An animated adventure entry that rounds out the demo catalog with global streaming content.",
    posterUrl: "https://images.justwatch.com/backdrop/272489138/s640/drifting-home.jpg"
  }
];

export const ottCatalog = titles.map((title, index) => ({
  ...title,
  ...demoVideos[index % demoVideos.length]
}));

export function getContentById(movieId) {
  return ottCatalog.find((item) => item.id === movieId) || ottCatalog[0];
}
