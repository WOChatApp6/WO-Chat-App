export interface SignUpParams {
  email: string;
  password: string;
  userDetails: any;
}

export class Login {
  static readonly type = '[Auth] Login';
  constructor(public email: string, public password: string) {}
}

export class Logout {
  static readonly type = '[Auth] Logout';
}

export class SignUp {
  static readonly type = '[Auth] SignUp';
  constructor(public payload: SignUpParams) {}
}

export class SignUpSuccess {
  static readonly type = '[Auth] Sign Up Success';
  constructor(public user: any) {}
}

export class SignUpError {
  static readonly type = '[Auth] Sign Up Error';
  constructor(public error: any) {}
}

export class ForgotPassword {
  static readonly type = '[Auth] ForgotPassword';
  constructor(public email: string) {}
}

export class ForgotPasswordSuccess {
  static readonly type = '[Auth] Forgot Password Success';
  constructor(public response: string) {}
}

export class ForgotPasswordError {
  static readonly type = '[Auth] Forgot Password Error';
  constructor(public error: any) {}
}
