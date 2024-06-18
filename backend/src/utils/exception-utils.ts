//
//
//
//
//

export class RecordNotFoundException extends Error {
  constructor(message: string) {
    super(message);
  }

  toObject() {
    return {
      message: this.message,
    };
  }
}

export class UnauthorizedException extends Error {
  constructor(message?: string) {
    super(message);
  }

  toObject() {
    return {
      message: this.message,
    };
  }
}

//
//
//
//
//

interface FieldExceptionData {
  message: string;
}

export class FieldException extends Error {
  private field: string;
  private data: FieldExceptionData;
  constructor(field: string, data: FieldExceptionData) {
    super(data.message);
    this.field = field;
    this.data = data;
  }

  toObject() {
    return {
      field: this.field,
      data: this.data,
    };
  }
}

//
//
//
//
//

interface ExceptionOptions {
  data: {
    [key: string]: any;
  };
}

export class Exception extends Error {
  private options?: ExceptionOptions;

  constructor(message: string, options?: ExceptionOptions) {
    super(message);
    this.options = options;
  }

  toObject() {
    const obj: {
      message: string;
      options?: ExceptionOptions;
    } = {
      message: this.message,
    };
    if (this.options) {
      obj.options = this.options;
    }
    return obj;
  }
}
