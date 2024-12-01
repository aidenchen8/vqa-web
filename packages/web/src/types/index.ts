export interface TableRow {
  question: string;
  questionTranslation: string;
  answer: string;
  vgGuide: string;
  vgGuideTranslation: string;
}

export interface UserInfo {
  id: string;
  username: string;
  roles: string[];
  token: string;
}
