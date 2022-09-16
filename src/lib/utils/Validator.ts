import { emailRegex } from "../constants/generic.ts";
import { enumContains } from "./generic.ts";

type Type = "array" | "object" | "boolean" | "number" | "string";

export default class Validator {
  private errors: string[] = [];
  private value: any;
  private failed = false;
  private shouldSkip = false;
  private shouldSkipNext = false;

  constructor(value: any) {
    this.value = value;
  }

  public exists(message?: string) {
    const { errors, value } = this;
    if (!this.checkShouldValidate()) return this;

    if (value == null) {
      errors.push(message ?? "There's nothing here");
    } else if (value.length != null && value.length === 0) {
      errors.push(message ?? "There's nothing here");
    }

    this.setIfFailed();
    return this;
  }

  public is(type: Type, message?: string) {
    const { errors, value } = this;
    if (!this.checkShouldValidate()) return this;

    if (type === "array") {
      if (!Array.isArray(value)) {
        errors.push(message ?? "Invalid data");
      }
    } else if (type != null && typeof value !== type) {
      errors.push(message ?? "Invalid data");
    }

    this.setIfFailed();
    return this;
  }

  public instanceOf(instance: any, message?: string) {
    const { errors, value } = this;
    if (!this.checkShouldValidate()) return this;

    if (!(value instanceof instance)) {
      errors.push(message ?? "Invalid data");
    }

    this.setIfFailed();
    return this;
  }

  public canBe(type: "number" | "json", message?: string) {
    const { errors, value } = this;
    if (!this.checkShouldValidate()) return this;

    switch (type) {
      case "number":
        if (isNaN(Number(value))) errors.push(message ?? "Must be a number");
        break;
      case "json":
        try {
          JSON.parse(value);
        } catch (e) {
          errors.push(message ?? "Must be JSON");
        }
        break;
      default:
        break;
    }

    this.setIfFailed();
    return this;
  }

  public length = {
    greaterThan: (amount: number, inclusive?: boolean, message?: string) => {
      const { errors, value } = this;
      if (!this.checkShouldValidate()) return this;

      const lengthType = typeof value === "string" ? "characters" : "entries";
      const text =
        message != null
          ? message
          : inclusive
          ? `Must be at least ${amount} ${lengthType}`
          : `Must be greater than ${amount} ${lengthType}`;

      if (
        value.length != null &&
        (inclusive ? value.length < amount : value.length <= amount)
      ) {
        errors.push(text);
      }

      this.setIfFailed();
      return this;
    },

    lessThan: (amount: number, inclusive?: boolean, message?: string) => {
      const { errors, value } = this;
      if (!this.checkShouldValidate()) return this;

      const lengthType = typeof value === "string" ? "characters" : "entries";
      const text =
        message != null
          ? message
          : inclusive
          ? `Must be a maximum of ${amount} ${lengthType}`
          : `Must be less than ${amount} ${lengthType}`;

      if (
        value.length != null &&
        (inclusive ? value.length > amount : value.length >= amount)
      ) {
        errors.push(text);
      }

      this.setIfFailed();
      return this;
    },

    greaterThanOrEqualTo: (amount: number, message?: string) =>
      this.length.greaterThan(amount, true, message),

    lessThanOrEqualTo: (amount: number, message?: string) =>
      this.length.lessThan(amount, true, message),

    equalTo: (amount: number, message?: string) => {
      const { errors, value } = this;
      if (!this.checkShouldValidate()) return this;

      const lengthType = typeof value === "string" ? "characters" : "entries";

      if (value.length != null && value.length !== amount) {
        errors.push(message ?? `Must consist of ${amount} ${lengthType}`);
      }

      this.setIfFailed();
      return this;
    },
  };

  public regex = {
    matches: (regex: RegExp, message: string) => {
      const { errors, value } = this;
      if (!this.checkShouldValidate()) return this;

      if (typeof value !== "string" || !value.match(regex)) {
        errors.push(message ?? "Does not match pattern");
      }

      this.setIfFailed();
      return this;
    },
    isEmail: (message?: string) =>
      this.regex.matches(
        emailRegex,
        message ?? "Must conform with example@email.com"
      ),
  };

  public number = {
    greaterThan: (amount: number, inclusive?: boolean, message?: string) => {
      const { errors, value } = this;
      if (!this.checkShouldValidate()) return this;

      const text =
        message != null
          ? message
          : inclusive
          ? `Must be at least ${amount}`
          : `Must be greater than ${amount}`;

      if (
        typeof value === "number" &&
        (inclusive ? value < amount : value <= amount)
      ) {
        errors.push(text);
      }

      this.setIfFailed();
      return this;
    },

    lessThan: (amount: number, inclusive?: boolean, message?: string) => {
      const { errors, value } = this;
      if (!this.checkShouldValidate()) return this;

      const text =
        message != null
          ? message
          : inclusive
          ? `Must be a maximum of ${amount}`
          : `Must be less than ${amount}`;

      if (
        typeof value === "number" &&
        (inclusive ? value > amount : value >= amount)
      ) {
        errors.push(text);
      }

      this.setIfFailed();
      return this;
    },

    greaterThanOrEqualTo: (amount: number, message?: string) =>
      this.number.greaterThan(amount, true, message),

    lessThanOrEqualTo: (amount: number, message?: string) =>
      this.number.lessThan(amount, true, message),
  };

  public enum = {
    within: (_enum: any, message?: string) => {
      const { errors, value } = this;
      if (!this.checkShouldValidate()) return this;

      if (!enumContains(_enum, value)) {
        errors.push(message ?? "Invalid data");
      }

      this.setIfFailed();
      return this;
    },
  };

  public custom(validationFunction: (value: any) => string | void) {
    const { errors, value } = this;
    if (!this.checkShouldValidate()) return this;

    const error = validationFunction(value);
    if (error) errors.push(error);

    this.setIfFailed();
    return this;
  }

  public skipIf(pass: boolean) {
    this.shouldSkip = pass;
    return this;
  }

  public skipNextIf(pass: boolean) {
    this.shouldSkipNext = pass;
    return this;
  }

  private checkShouldSkipNext() {
    const { shouldSkipNext } = this;
    if (shouldSkipNext) {
      this.shouldSkipNext = false;
      return true;
    }
    return false;
  }

  private checkShouldSkip() {
    const { shouldSkip } = this;
    return shouldSkip;
  }

  private checkHasFailed() {
    const { failed } = this;
    return failed;
  }

  private checkShouldValidate() {
    return (
      !this.checkShouldSkipNext() &&
      !this.checkShouldSkip() &&
      !this.checkHasFailed()
    );
  }

  private setIfFailed() {
    this.failed = this.errors.length > 0;
  }

  public getErrors(): string[] {
    return this.errors;
  }

  public getValue(): any {
    return this.value;
  }

  public getFailed(): boolean {
    return this.failed;
  }
}
