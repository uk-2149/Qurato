import { YouTubeVideo, YouTubeVideoListResponse, YouTubeVideoData } from "@/types";

export async function fetchPlaylistVideos(playlistId: string) {
  const API_KEY = process.env.YOUTUBE_API_KEY;
  const allVideos: YouTubeVideoData[] = [];
  let nextPageToken = "";
  let index = 0;

  try {
    do {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&maxResults=50&pageToken=${nextPageToken}&key=${API_KEY}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error?.message || "Failed to fetch");

      const videos = data.items.map((item: any) => {
        index++;
        return {
          title: item.snippet.title,
          description: item.snippet.description,
          videoId: item.contentDetails.videoId,
          thumbnail: item.snippet.thumbnails?.high?.url,
          order: index,
        };
      });

      allVideos.push(...videos);

      nextPageToken = data.nextPageToken || "";
    } while (nextPageToken);

    return allVideos;
  } catch (err) {
    console.error("YT playlist fetch error:", err);
    throw err;
  }
}

export const extractVideoId = (url: string) => {
  const u = new URL(url);

  if (u.hostname.includes("youtu.be")) {
    return u.pathname.slice(1);
  }

  if (u.searchParams.get("v")) {
    return u.searchParams.get("v");
  }

  if (u.pathname.startsWith("/shorts/")) {
    return u.pathname.split("/shorts/")[1];
  }

  return null;
};

export function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

export function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  const hours = Number(match?.[1] || 0);
  const minutes = Number(match?.[2] || 0);
  const seconds = Number(match?.[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

export async function fetchVideoMetadata(
  videoIds: string[]
): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY!;
  const batches = chunkArray(videoIds, 50);

  const results: YouTubeVideo[] = [];

  for (const batch of batches) {
    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/videos` +
        `?part=snippet,contentDetails` +
        `&id=${batch.join(",")}` +
        `&key=${apiKey}`
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`YouTube API error: ${text}`);
    }

    const data: YouTubeVideoListResponse = await res.json();
    results.push(...data.items);
  }

  return results;
}
