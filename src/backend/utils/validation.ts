export class ValidationError extends Error {
  constructor(public errors: Record<string, string>) {
    super('Validation Error');
    this.name = 'ValidationError';
  }
}

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

export const validatePrice = (price: number): boolean => {
  return price > 0 && !isNaN(price);
};

export const validateDate = (date: string | Date): boolean => {
  const dateObj = new Date(date);
  return dateObj instanceof Date && !isNaN(dateObj.getTime());
};

export const validateDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate < endDate;
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return value !== null && value !== undefined;
};

export const validateStringLength = (
  value: string,
  min: number,
  max: number
): boolean => {
  return value.length >= min && value.length <= max;
};

export const validateExperienceData = (data: any): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!validateRequired(data.title)) {
    errors.title = 'Title is required';
  }

  if (!validateRequired(data.description)) {
    errors.description = 'Description is required';
  }

  if (!validateRequired(data.location)) {
    errors.location = 'Location is required';
  }

  if (!validatePrice(data.price)) {
    errors.price = 'Price must be a positive number';
  }

  if (data.maxParticipants && data.maxParticipants < 1) {
    errors.maxParticipants = 'Max participants must be at least 1';
  }

  if (!validateDate(data.startDate)) {
    errors.startDate = 'Invalid start date';
  }

  if (!validateDate(data.endDate)) {
    errors.endDate = 'Invalid end date';
  }

  if (validateDate(data.startDate) && validateDate(data.endDate)) {
    if (!validateDateRange(new Date(data.startDate), new Date(data.endDate))) {
      errors.dateRange = 'End date must be after start date';
    }
  }

  return errors;
};

export const validateBookingData = (data: any): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!validateRequired(data.experienceId)) {
    errors.experienceId = 'Experience ID is required';
  }

  if (data.numberOfParticipants < 1) {
    errors.numberOfParticipants = 'Number of participants must be at least 1';
  }

  if (!validatePrice(data.totalPrice)) {
    errors.totalPrice = 'Total price must be a positive number';
  }

  if (!validateRequired(data.bookerName)) {
    errors.bookerName = 'Name is required';
  }

  if (!validateEmail(data.bookerEmail)) {
    errors.bookerEmail = 'Invalid email address';
  }

  if (!validatePhone(data.bookerPhone)) {
    errors.bookerPhone = 'Invalid phone number';
  }

  return errors;
};

export const validateReviewData = (data: any): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!validateRequired(data.experienceId)) {
    errors.experienceId = 'Experience ID is required';
  }

  if (data.rating < 1 || data.rating > 5) {
    errors.rating = 'Rating must be between 1 and 5';
  }

  if (!validateRequired(data.title)) {
    errors.title = 'Title is required';
  }

  if (!validateRequired(data.comment)) {
    errors.comment = 'Comment is required';
  }

  return errors;
};
