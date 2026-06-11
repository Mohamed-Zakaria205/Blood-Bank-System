import { AxiosError } from 'axios';

export class ApiError extends Error {
  public status?: number;
  public data?: any;

  constructor(message: string, status?: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    // Maintain correct prototype chain for subclassing built-ins
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

const ERROR_TRANSLATIONS: Record<string, string> = {
  // Auth & Users
  'invalid credentials': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
  'account is disabled': 'هذا الحساب معطل. يرجى التواصل مع المدير',
  'account is locked': 'الحساب مقفل مؤقتاً. يرجى المحاولة لاحقاً',
  'user not found': 'المستخدم غير موجود',
  'email is already registered': 'البريد الإلكتروني مسجل بالفعل لمستخدم آخر',
  'email is already in use': 'البريد الإلكتروني مسجل بالفعل لمستخدم آخر',
  'passwords must have at least one non alphanumeric character': 'يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل (مثل @، #، $)',
  'passwords must have at least one lowercase': 'يجب أن تحتوي كلمة المرور على حرف صغير واحد على الأقل',
  'passwords must have at least one uppercase': 'يجب أن تحتوي كلمة المرور على حرف كبير واحد على الأقل',
  'passwords must have at least one digit': 'يجب أن تحتوي كلمة المرور على رقم واحد على الأقل',
  'passwords must be at least': 'كلمة المرور قصيرة جداً',

  // Donors
  'donor not found': 'المتبرع غير موجود',
  'national id already exists': 'الرقم القومي مسجل بالفعل لمستخدم آخر',
  'national id is already registered': 'الرقم القومي مسجل بالفعل لمستخدم آخر',
  'donor is not eligible': 'المتبرع غير مؤهل للتبرع حالياً',
  'donor is ineligible': 'المتبرع غير مؤهل للتبرع حالياً',

  // Appointments
  'appointment not found': 'الموعد غير موجود',
  'slot is already booked': 'الفترة الزمنية محجوزة بالفعل',
  'invalid appointment date': 'تاريخ الموعد غير صحيح',

  // Bags & Inventory
  'blood bag not found': 'كيس الدم غير موجود',
  'bag code already exists': 'كود كيس الدم مسجل بالفعل',
  'insufficient inventory': 'المخزون غير كافٍ',
  'insufficient stock': 'المخزون غير كافٍ',
  'blood bag is expired': 'كيس الدم منتهي الصلاحية',
  'blood bag is unsafe': 'كيس الدم غير آمن للاستخدام',

  // Campaigns
  'campaign not found': 'الحملة غير موجودة',
  'campaign has already ended': 'الحملة انتهت بالفعل',

  // General & HTTP Status Codes
  'unauthorized': 'غير مصرح بالدخول. يرجى تسجيل الدخول مجدداً',
  'forbidden': 'غير مسموح لك بإجراء هذه العملية',
  'network error': 'حدث خطأ في الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت',
  'timeout': 'انتهت مهلة الاتصال بالخادم. حاول مجدداً لاحقاً',
};
export function translateErrorMessage(msg: string, status?: number, isCustom = false): string {
  if (!msg) return 'حدث خطأ غير متوقع';

  const lowerMsg = msg.toLowerCase();

  // Handle network or timeout errors
  if (lowerMsg.includes('network error') || lowerMsg.includes('err_connection') || lowerMsg.includes('timeout')) {
    return 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
  }

  // Exact matching against cleaned message
  const cleanMsg = msg.trim().toLowerCase().replace(/\.$/, '');
  
  // Try to find a partial match or prefix match for common password errors
  if (cleanMsg.includes('passwords must be at least')) {
    return ERROR_TRANSLATIONS['passwords must be at least'];
  }

  if (ERROR_TRANSLATIONS[cleanMsg]) {
    return ERROR_TRANSLATIONS[cleanMsg];
  }

  // Fallback messages based on HTTP status codes ONLY if not a custom backend message
  if (status && !isCustom) {
    switch (status) {
      case 401:
        return 'انتهت الجلسة، يرجى تسجيل الدخول مجدداً';
      case 403:
        return 'غير مسموح لك بإجراء هذه العملية';
      case 404:
        return 'المورد المطلوب غير موجود';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'حدث خطأ داخلي في الخادم. يرجى المحاولة لاحقاً.';
    }
  }

  return msg;
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const status = error.response?.status;
    const data = error.response?.data;
    
    // Extract message safely to avoid [object Object] or raw HTML
    let message = error.message || 'حدث خطأ في الاتصال بالخادم';
    let isCustom = false;
    
    if (typeof data === 'string') {
      // Use string data as message only if it doesn't look like HTML
      if (!data.trim().startsWith('<')) {
        message = data;
        isCustom = true;
      }
    } else if (data && typeof data === 'object') {
      if (typeof data.message === 'string' && data.message.trim()) {
        message = data.message;
        isCustom = true;
      } else if (typeof data.title === 'string' && data.title.trim()) {
        message = data.title;
        isCustom = true;
      }
    }
    
    // Translate the main error message
    message = translateErrorMessage(message, status, isCustom);
    
    // Extract validation errors if they exist (ASP.NET Core format or custom wrapper)
    const validationErrors = data?.errors;
    if (validationErrors && typeof validationErrors === 'object' && Object.keys(validationErrors).length > 0) {
      const errorDetails = Object.entries(validationErrors)
        .map(([field, errs]) => {
          const errList = Array.isArray(errs) ? errs.join(', ') : errs;
          return `${field}: ${errList}`;
        })
        .join(' | ');
      message = `${message} - ${errorDetails}`;
    }

    return new ApiError(message, status, data);
  }

  if (error instanceof Error) {
    return new ApiError(translateErrorMessage(error.message, undefined, true));
  }

  // Fallback for ad-hoc throws (if any missed)
  const fallback = error as any;
  const status = fallback?.response?.status;
  const data = fallback?.response?.data;
  let isCustom = false;
  let message = 'حدث خطأ غير متوقع';

  if (data && typeof data === 'object' && typeof data.message === 'string') {
    message = data.message;
    isCustom = true;
  } else if (typeof fallback?.message === 'string') {
    message = fallback.message;
    isCustom = !fallback.message.toLowerCase().includes('timeout') && 
               !fallback.message.toLowerCase().includes('network');
  }
  
  message = translateErrorMessage(message, status, isCustom);
  return new ApiError(message, status, data);
}
