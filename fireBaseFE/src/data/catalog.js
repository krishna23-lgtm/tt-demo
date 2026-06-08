const TRAILER_DURATION_SECONDS = 180;

function buildTrailerSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

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
    posterUrl: "https://images.justwatch.com/backdrop/284447785/s640/the-summer-i-turned-pretty.jpg",
    trailerQuery: "The Summer I Turned Pretty official trailer Prime Video",
    youtubeVideoId: "nB9eG5TzdU0"
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
    posterUrl: "https://images.justwatch.com/backdrop/260494796/s640/scam-1992-the-harshad-mehta-story.jpg",
    trailerQuery: "Scam 1992 The Harshad Mehta Story official trailer Sony LIV",
    youtubeVideoId: "ISORfez27og"
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
    posterUrl: "https://images.justwatch.com/backdrop/309385870/s640/permanent-roommates.jpg",
    trailerQuery: "Permanent Roommates official trailer TVF",
    youtubeVideoId: "tKNQMYmQjnA"
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
    posterUrl: "https://images.justwatch.com/poster/345633546/s718/pati-patni-aur-woh-2.jpg",
    trailerQuery: "Pati Patni Aur Woh Do official trailer teaser",
    youtubeVideoId: "ceooxuS-sww"
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
    posterUrl: "https://images.justwatch.com/backdrop/246950716/s640/panchayat.jpg",
    trailerQuery: "Panchayat official trailer Prime Video",
    youtubeVideoId: "mojZJ7oeD_g"
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
    posterUrl: "https://images.justwatch.com/poster/345462039/s718/krishnavataram-part-1-the-heart.jpg",
    trailerQuery: "Krishnavataram official trailer teaser ETV Win",
    youtubeVideoId: "KIwC1m7etLE"
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
    posterUrl: "https://images.justwatch.com/backdrop/32386/s640/scary-movie.jpg",
    trailerQuery: "Scary Movie official trailer",
    youtubeVideoId: "cGgWAHXuTKc"
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
    posterUrl: "https://images.justwatch.com/backdrop/258798020/s640/happy-ending.jpg",
    trailerQuery: "Happy Ending official trailer Saif Ali Khan",
    youtubeVideoId: "e0M2ptpW4_k"
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
    posterUrl: "https://images.justwatch.com/backdrop/339149507/s640/gullak.jpg",
    trailerQuery: "Gullak 5 official trailer Sony LIV",
    youtubeVideoId: "7DJLNCp5HyI"
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
    posterUrl: "https://images.justwatch.com/backdrop/163344875/s640/flames.jpg",
    trailerQuery: "FLAMES official trailer TVF",
    youtubeVideoId: "NkdCgjqQq7s"
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
    posterUrl: "https://images.justwatch.com/backdrop/302895294/s640/the-family-man.jpg",
    trailerQuery: "The Family Man official trailer Prime Video",
    youtubeVideoId: "XatRGut65VI"
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
    posterUrl: "https://images.justwatch.com/poster/209543496/s718/.jpg",
    trailerQuery: "Rail Tamil movie official trailer teaser",
    youtubeVideoId: "Dy2UQeYvnZM"
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
    posterUrl: "https://images.justwatch.com/backdrop/341988268/s640/aspirants.jpg",
    trailerQuery: "Aspirants official trailer TVF",
    youtubeVideoId: "ViOutJ0kuJY"
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
    posterUrl: "https://images.justwatch.com/backdrop/344278351/s640/chand-mera-dil.jpg",
    trailerQuery: "Chand Mera Dil official teaser trailer",
    youtubeVideoId: "rRQ8oKCoYrQ"
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
    posterUrl: "https://images.justwatch.com/backdrop/272489138/s640/drifting-home.jpg",
    trailerQuery: "Drifting Home official trailer Netflix",
    youtubeVideoId: "BSE2KGU5png"
  }
];

export const ottCatalog = titles.map((title) => ({
  ...title,
  durationLabel: "Trailer / teaser",
  sourceLabel: "Trailer / teaser",
  durationSeconds: TRAILER_DURATION_SECONDS,
  trailerSearchUrl: buildTrailerSearchUrl(title.trailerQuery)
}));

export function getContentById(movieId) {
  return ottCatalog.find((item) => item.id === movieId) || ottCatalog[0];
}
