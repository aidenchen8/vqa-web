export interface TableRow {
  question: string;
  questionTranslation: string;
  answer: string;
  vgGuide: string;
  vgGuideTranslation: string;
}

export interface BBox {
  type: string;
  bbox2d: number[];
  _id?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  roles: string[];
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expires: string;
  refreshExpires: string;
}

export interface LoginResponse extends TokenResponse {
  user: UserInfo;
}

export interface RegisterData {
  username: string;
  encryptedPassword: string;
}

export interface RegisterResponse extends TokenResponse {
  user: UserInfo;
}

export interface UpdateRolesData {
  userId: string;
  roles: string[];
}

export interface BatchUpdateRolesData {
  userIds: string[];
  roles: string[];
}

export interface ChangePasswordData {
  oldEncryptedPassword: string;
  newEncryptedPassword: string;
}

export interface FormStats {
  totalQuestions: number;
  completedQuestions: number;
}

export interface FormDataItem {
  questionId: number;
  question: string;
  questionTranslation: string;
  answer: string;
  vgGuide: string;
  vgGuideTranslation: string;
  user: {
    username: string;
  };
  updatedAt: string;
  imageFileName: string;
}

export interface LastEditedResponse {
  lastEditedFile: string;
}

export interface SaveFormData {
  question: string;
  answer: string;
  vgGuide: string;
  selectedBboxes: BBox[];
  imageFileName: string;
}

export type SaveFormResponse = FormDataItem;

export type FormQueryResponse = SaveFormData[];
export interface CSVUploadData {
  fileContent: string;
  forceUpdate: boolean;
  type: string;
}

export interface CSVUploadResponse {
  message: string;
  status?: "success";
  requireConfirmation?: boolean;
}

export interface CSVCheckResponse {
  hasData: boolean;
}

export interface CSVDataMapItem {
  questionsMap: Record<string, FormDataItem[]>;
  fileIndexMap: string[];
  type: string;
}

export type CSVDataResponse = CSVDataMapItem[];
