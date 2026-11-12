export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Data tidak ditemukan') {
    super(404, message);
  }
}
