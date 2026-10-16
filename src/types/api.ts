/**
 * Standardized API response envelopes matching backend Spring Boot contracts.
 */

export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}

export interface FieldErrorDto {
  field: string;
  rejectedValue: any;
  message: string;
}

export interface ApiErrorResponse {
  code: number;
  message: string;
  errors?: FieldErrorDto[] | null;
  timestamp: string;
}

export class ApiError extends Error {
  code: number;
  errors: Record<string, string>;
  fieldErrors: FieldErrorDto[];
  timestamp: string;

  constructor(errorResponse: ApiErrorResponse) {
    super(errorResponse.message || 'API request failed');
    this.name = 'ApiError';
    this.code = errorResponse.code;
    this.timestamp = errorResponse.timestamp;
    this.fieldErrors = errorResponse.errors || [];
    
    // Convert array of field errors into an easy-to-use dictionary: { [field]: message }
    this.errors = (errorResponse.errors || []).reduce((acc, curr) => {
      acc[curr.field] = curr.message;
      return acc;
    }, {} as Record<string, string>);
  }

  getFieldError(field: string): string | undefined {
    return this.errors[field];
  }
}
