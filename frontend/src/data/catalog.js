export const ottCatalog = [
  {
    id: "movie123",
    title: "Big Buck Bunny",
    type: "Film",
    year: "2008",
    rating: "U",
    durationLabel: "9 min",
    durationSeconds: 596,
    provider: "ShortsTV",
    language: "English",
    genre: "Animation",
    plan: "Free",
    synopsis: "A bright animated short with clear visuals and an audio track that is easy to verify during sync tests.",
    posterUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
  },
  {
    id: "elephants-dream",
    title: "Elephants Dream",
    type: "Film",
    year: "2006",
    rating: "PG",
    durationLabel: "11 min",
    durationSeconds: 653,
    provider: "DocuBay",
    language: "English",
    genre: "Sci-Fi",
    plan: "Premium",
    synopsis: "A surreal open movie with dialogue, ambient audio, and strong scene changes for watch-party testing.",
    posterUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4"
  },
  {
    id: "sintel",
    title: "Sintel",
    type: "Film",
    year: "2010",
    rating: "PG",
    durationLabel: "15 min",
    durationSeconds: 888,
    provider: "Lionsgate Play",
    language: "English",
    genre: "Fantasy",
    plan: "Premium",
    synopsis: "Fantasy animation with music, dialogue, and action beats that make room sync visible and audible.",
    posterUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4"
  },
  {
    id: "tears-of-steel",
    title: "Tears of Steel",
    type: "Film",
    year: "2012",
    rating: "PG-13",
    durationLabel: "12 min",
    durationSeconds: 734,
    provider: "Sony LIV",
    language: "English",
    genre: "Action",
    plan: "Premium",
    synopsis: "Live action sci-fi sample content with a full audio track, useful for testing host-controlled playback.",
    posterUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4"
  }
];

export function getContentById(movieId) {
  return ottCatalog.find((item) => item.id === movieId) || ottCatalog[0];
}

export const providerBadges = ["JioHotstar", "ZEE5", "Sony LIV", "Lionsgate", "Aha", "SunNXT", "Hoichoi", "ShortsTV"];

export const contentRails = [
  {
    title: "Trending on watch parties",
    ids: ["movie123", "sintel", "tears-of-steel", "elephants-dream"]
  },
  {
    title: "Premium picks across OTTs",
    ids: ["sintel", "elephants-dream", "tears-of-steel", "movie123"]
  },
  {
    title: "Free movies to start now",
    ids: ["movie123", "tears-of-steel", "elephants-dream", "sintel"]
  }
];

export function titlesForRail(ids) {
  return ids.map(getContentById);
}
