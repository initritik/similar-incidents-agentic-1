export interface ApiError {
  detail: string | { msg: string }[];
  message?: string;
}