export class NamedError extends Error {
    constructor(name: string, message?: string) {
        super(message);
        this.name = name;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class NotFoundError extends NamedError {
    constructor(message: string) {
        super('NotFoundError', message);
    }
}

export class ValidationError extends NamedError {
    constructor(message: string) {
        super('ValidationError', message);
    }
}
