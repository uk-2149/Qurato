export async function fetchPlaylistVideos(playlistId: string) {
  const API_KEY = process.env.YOUTUBE_API_KEY;

  const res = await fetch(
    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&key=${API_KEY}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch playlist");
  }

  const data = await res.json();

  return data.items.map((item: any, index: number) => ({
    title: item.snippet.title,
    description: item.snippet.description,
    videoId: item.contentDetails.videoId,
    thumbnail: item.snippet.thumbnails?.high?.url,
    order: index,
  }));
}
