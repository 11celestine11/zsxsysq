export interface Chapter {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  chapters: Chapter[];
  isCollected: boolean;
  timestamp: number;
  tags?: string[];
}

export interface Relationship {
  targetId: string;
  title: string;
  desc: string;
}

export interface Character {
  id: string;
  name: string;
  desc: string;
  relationships?: Relationship[];
}

export interface RelationshipPreset {
  id: string;
  title: string;
  desc: string;
}

export interface Worldbook {
  id: string;
  title: string;
  content: string;
}

export interface Outline {
  id: string;
  title: string;
  content: string;
}

export interface ApiSettings {
  url: string;
  key: string;
  model: string;
}

export interface Profile {
  name: string;
  desc: string;
  avatar: string;
  bg: string;
}

export interface ApiPreset {
  name: string;
  url: string;
  key: string;
  model: string;
}

export interface CssPreset {
  name: string;
  code: string;
}

export interface WritingStyle {
  id: string;
  name: string;
  content: string;
}

export interface GlobalPreset {
  id: string;
  name: string;
  content: string;
}
