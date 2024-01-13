import {
  AfterContentInit,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Store } from '@ngxs/store';
import { ForgotPassword, Login } from '../store/auth.action';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements AfterContentInit {
  @ViewChild('forgotPasswordModal') forgotPasswordModal!: ElementRef;

  LoginForm: FormGroup;
  forgotPwdForm: FormGroup;
  errorMessage = '';
  user$: Observable<any>;
  error$: Observable<any>;
  resetPasswordResponse$: Observable<string>;
  isForgot: boolean = false;
  emailForForgotPassword: string = '';
  isEmailExists: boolean = false;
  isEmailNotExists: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private store: Store
  ) {
    this.LoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
    this.forgotPwdForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });

    this.resetPasswordResponse$ = this.store.select(
      (state) => state.auth.resetPasswordResponse
    );
    this.resetPasswordResponse$.subscribe((res) => {
      if (res === 'Password reset email sent successfully') {
        this.isEmailExists = true;
      } else if (res === 'Email is not exists') {
        this.isEmailNotExists = true;
      }
    });
    this.error$ = this.store.select((state) => state.auth.error);
    this.error$.subscribe((err) => {
      if (err) {
        const errorCode = err?.code;
        if (errorCode === 'auth/invalid-email') {
          this.errorMessage =
            'The provided email is not a valid email. Please try again.';
        } else if (errorCode === 'auth/user-disabled') {
          this.errorMessage =
            'The user account has been disabled. Please contact support.';
        } else if (errorCode === 'auth/invalid-login-credentials') {
          this.errorMessage =
            'Invalid login credentials. Please make sure you have entered the correct email and password.';
        } else {
          this.errorMessage = err.message;
        }
      }
    });
    this.user$ = this.store.select((state) => state.auth.user);
    this.user$.subscribe((user) => {
      if (user) {
        this.errorMessage = '';
        this.router.navigate(['/home']);
      }
    });
  }

  InitForm() {
    this.forgotPwdForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
    this.LoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngAfterContentInit() {
    this.authService.getAllUsers();
  }

  onSubmit() {
    if (this.LoginForm.valid) {
      const { email, password } = this.LoginForm.value;
      this.store.dispatch(new Login(email, password));
    }
    // this.authService.loginWithEmailAndPassword(this.LoginForm.value.email, this.LoginForm.value.password).then((res) => {
    //   const userId: any = res.user?.uid || null;
    //   console.log(userId)
    //   localStorage.setItem('token', userId);
    //   this.router.navigate(['/home']);
    //   this.LoginForm.reset();
    // }).catch((err) => {
    //   console.log(err , 'error')
    //   this.errorMessage = err.message;
    // })
  }

  onSignup() {
    this.router.navigate(['/sign-up']);
  }

  loginWithGoogle() {
    this.authService.signupWithGoogle();
  }

  loginWithFacebook() {
    this.authService.signupWithFacebook();
  }

  isFieldInvalid(field: string): any {
    const control = this.LoginForm.get(field);
    if (control) {
      return control.invalid && (control.touched || control.dirty);
    }
  }

  loginWithTwitter() {
    this.authService.signupWithTwitter();
  }

  forgotPassword() {
    this.isForgot = !this.isForgot;
  }

  sendMail() {
    this.store.dispatch(new ForgotPassword(this.emailForForgotPassword));
    this.emailForForgotPassword = '';
  }

  closeModal() {
    this.isForgot = false;
    this.forgotPwdForm.reset();
  }

  done() {
    this.isForgot = false;
    this.isEmailExists = false;
    this.InitForm();
  }
}
