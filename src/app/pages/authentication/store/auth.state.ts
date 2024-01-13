import { Action, Selector, State, StateContext } from '@ngxs/store';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  ForgotPassword,
  ForgotPasswordError,
  ForgotPasswordSuccess,
  Login,
  Logout,
  SignUp,
  SignUpError,
  SignUpSuccess,
} from './auth.action';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

export interface User {
  name: string;
  email: string;
  mobile: string;
}

export interface AuthStateModel {
  user: any | null;
  error: any | null;
  resetPasswordResponse: any | null;
}

//create multiple states with diff name and use like this:
// Example :- this.user$ = this.store.select((state) => state.auth.user);
@State<AuthStateModel>({
  name: 'auth',
  defaults: {
    user: null,
    error: null,
    resetPasswordResponse: null,
  },
})
@Injectable()
export class AuthState {
  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    private authService: AuthService
  ) {}

  @Selector()
  static user(state: AuthStateModel): any | null {
    return state.user;
  }

  @Action(Login)
  async login(ctx: StateContext<AuthStateModel>, { email, password }: Login) {
    try {
      const userCredential = await this.authService.loginWithEmailAndPassword(
        email,
        password
      );
      ctx.patchState({ user: userCredential.user });
    } catch (error) {
      ctx.patchState({ error: error });
    }
  }

  @Action(Logout)
  async logout(ctx: StateContext<AuthStateModel>) {
    ctx.patchState({ user: null });
    this.router.navigate(['/login']);
  }

  @Action(ForgotPassword)
  async forgotPassword(
    ctx: StateContext<AuthStateModel>,
    { email }: ForgotPassword
  ) {
    try {
      const response: any = await this.authService.resetPassword(email);
      ctx.dispatch(new ForgotPasswordSuccess(response));
    } catch (error) {
      ctx.dispatch(new ForgotPasswordError(error));
    }
  }

  @Action(ForgotPasswordSuccess)
  forgotPasswordSuccess(
    ctx: StateContext<AuthStateModel>,
    { response }: ForgotPasswordSuccess
  ) {
    ctx.patchState({ resetPasswordResponse: response });
  }

  @Action(ForgotPasswordError)
  forgotPasswordError(
    ctx: StateContext<AuthStateModel>,
    { error }: ForgotPasswordError
  ) {
    ctx.patchState({ resetPasswordResponse: error });
  }

  @Action(SignUp)
  async SignUp(ctx: StateContext<AuthStateModel>, { payload }: SignUp) {
    try {
      const userCredential = await this.authService.SignUp(
        payload.email,
        payload.password,
        payload.userDetails
      );
      ctx.dispatch(new SignUpSuccess(userCredential));
    } catch (error) {
      ctx.dispatch(new SignUpError(error));
    }
  }

  @Action(SignUpSuccess)
  signUpSuccess(ctx: StateContext<AuthStateModel>, { user }: SignUpSuccess) {
    ctx.patchState({ user });
  }

  @Action(SignUpError)
  signUpError(ctx: StateContext<AuthStateModel>, { error }: SignUpError) {
    ctx.patchState({ user: null, error });
  }
}
