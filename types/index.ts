export type Course = {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  totalVideos?: number;
  type: "created" | "saved";
  shareId: string;
  source: "youtube" | "custom"
  playlistId?: string;
  authorId: string;
};

export type Lesson = {
  id: string;
  title: string;
  embedUrl: string;
  thumbnail?: string;
  description?: string;
  order: number;
};

export interface YouTubeVideoListResponse {
  kind: "youtube#videoListResponse";
  etag: string;
  items: YouTubeVideo[];
  pageInfo: {
    totalResults: number;
    resultsPerPage: number;
  };
}

export interface YouTubeVideo {
  kind: "youtube#video";
  etag: string;
  id: string;
  snippet: YouTubeSnippet;
  contentDetails: YouTubeContentDetails;
}

export interface YouTubeSnippet {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  channelTitle: string;
  categoryId: string;
  liveBroadcastContent: "none" | "live" | "upcoming";
  defaultLanguage?: string;
  defaultAudioLanguage?: string;
  tags?: string[];
  thumbnails: YouTubeThumbnails;
  localized?: {
    title: string;
    description: string;
  };
}

export interface YouTubeThumbnail {
  url: string;
  width: number;
  height: number;
}

export interface YouTubeThumbnails {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
}

export interface YouTubeContentDetails {
  duration: string; // ISO-8601 e.g. PT6M45S
  dimension: "2d" | "3d";
  definition: "sd" | "hd";
  caption: "true" | "false";
  licensedContent: boolean;
  projection: "rectangular" | "360";
}
