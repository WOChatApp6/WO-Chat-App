import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';
import { Store } from '@ngxs/store';
import { SignUp } from '../store/auth.action';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  SignUpForm: FormGroup;
  error: string = '';
  isSubmitted: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private store: Store
  ) {
    this.store
      .select((state) => state.auth.error)
      .subscribe((error) => {
        if (error) {
          this.error = error;
        }
      });
    this.store
      .select((state) => state.auth.user)
      .subscribe((user) => {
        if (user) {
          this.SignUpForm.reset();
          this.error = '';
        }
      });

    this.SignUpForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      mobile: [
        '',
        [Validators.required, Validators.pattern('^((\\+91-?)|0)?[0-9]{10}$')],
      ],
    });
  }

  onSignUp() {
    if (this.SignUpForm.valid) {
      const email = this.SignUpForm.value.email;
      const password = this.SignUpForm.value.password;
      const userData = {
        name: this.SignUpForm.value.name,
        email: this.SignUpForm.value.email,
        mobile: this.SignUpForm.value.mobile,
      };
      this.isSubmitted = true;
      this.store.dispatch(
        new SignUp({ email, password, userDetails: userData })
      );
      // this.router.navigate(['/home']);
      // this.SignUpForm.reset();
    }
  }

  onLogin() {
    this.router.navigate(['/login']);
  }
}
