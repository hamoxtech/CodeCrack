
export interface Meme {
  template_hint: string | null;
  caption: string | null;
  image_url: string | null;
}

export interface Hollywood {
  title_hint: string | null;
  analogy: string | null;
  poster_url: string | null;
}

export interface Anime {
  analogy: string | null;
}

export interface Sports {
  analogy: string | null;
}

export interface Serious {
  definition: string | null;
  code_example: string | null;
  common_pitfalls: string[] | null;
  best_practices: string[] | null;
}

export interface ExplanationResponse {
  topic: string;
  meme: Meme;
  hollywood: Hollywood;
  anime: Anime;
  sports: Sports;
  serious: Serious;
}

export interface ExplanationError {
    error: string;
}
