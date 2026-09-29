/** Generic contracts shared by web, mobile, and the API. Add domain contracts only after team modules are agreed. */
export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = { success: false; error: { code: string; message: string } };
export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
