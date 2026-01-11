// src/types/post.ts (или где у тебя общие типы)
export interface Post {
  id: number;                    // ← убираем string
  img: string;
  title: string;
  category: string;
  date: string;
  description: string;
}