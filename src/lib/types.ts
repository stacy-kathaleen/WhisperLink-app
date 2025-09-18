export interface Response {
  id: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  text: string;
  responses: Response[];
  createdAt: string;
}

export interface ThemeCluster {
  theme: string;
  posts: Post[];
}
