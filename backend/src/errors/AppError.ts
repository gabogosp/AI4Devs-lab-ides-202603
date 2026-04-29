export class ValidationError extends Error {
  constructor(
    public readonly details: string,
    message = 'Validation failed',
  ) {
    super(message);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

export class DuplicateEmailError extends Error {
  constructor() {
    super('Email already registered');
    this.name = 'DuplicateEmailError';
    Object.setPrototypeOf(this, DuplicateEmailError.prototype);
  }
}
