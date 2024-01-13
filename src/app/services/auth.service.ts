import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  TwitterAuthProvider,
} from 'firebase/auth';
import firebase from 'firebase/compat/app';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireDatabase } from '@angular/fire/compat/database';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  usersArray: any[] = [];
  allMails: any[] = [];

  constructor(
    private angularFireAuth: AngularFireAuth,
    private router: Router,
    private firestore: AngularFirestore
  ) {}

  async SignUp(
    email: string,
    password: string,
    userDetails: any
  ): Promise<any> {
    try {
      const userCredential =
        await this.angularFireAuth.createUserWithEmailAndPassword(
          email,
          password
        );
      const user: any = {
        uid: userCredential.user?.uid,
        email: userCredential.user?.email || '',
      };

      userDetails.userId = user.uid;

      await this.addUserDetails(user.uid, userDetails);
      return user;
    } catch (error) {
      throw error;
    }
  }

  async loginWithEmailAndPassword(
    email: string,
    password: string
  ): Promise<firebase.auth.UserCredential> {
    try {
      const userCredential =
        await this.angularFireAuth.signInWithEmailAndPassword(email, password);
      return userCredential;
    } catch (error) {
      console.error('Error logging in:', error);
      throw error;
    }
  }

  async signupWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      await this.angularFireAuth.signInWithPopup(provider).then((res) => {
        const userId: any = res.user?.uid || null;
        const userData = {
          name: res.user?.displayName,
          email: res.user?.email,
          mobile: res.user?.phoneNumber || null,
          userId: userId,
        };
        this.addUserDetails(userId, userData);
        this.router.navigate(['/home']);
      });
    } catch (error) {
      console.error('Google Sign-In Error:', error);
    }
  }

  async signupWithTwitter() {
    try {
      const provider = new TwitterAuthProvider();
      await this.angularFireAuth.signInWithPopup(provider).then((res) => {});
    } catch (error) {
      console.error('Twitter Sign-In Error:', error);
    }
  }

  async signupWithFacebook() {
    try {
      const provider = new FacebookAuthProvider();
      this.angularFireAuth.signInWithPopup(provider).then((res) => {
        const userId: any = res.user?.uid || null;
        const userData = {
          name: res.user?.displayName,
          email: res.user?.email,
          mobile: res.user?.phoneNumber || null,
          userId: userId,
        };
        this.addUserDetails(userId, userData);
        this.router.navigate(['/home']);
      });
    } catch (error) {
      console.error('Facebook Sign-In Error:', error);
    }
  }

  async resetPassword(email: string) {
    try {
      const emailExists = await this.isEmailExists(email);
      if (emailExists) {
        await this.angularFireAuth.sendPasswordResetEmail(email);
        return 'Password reset email sent successfully';
      } else {
        return 'Email is not exists';
      }
    } catch (error) {
      return error;
    }
  }

  async isEmailExists(email: string) {
    const data = this.allMails.includes(email);
    return data;
  }

  async addUserDetails(uid: string, userDetails: any): Promise<void> {
    try {
      const userDocRef = this.firestore.collection('users');
      userDocRef.doc(uid).set(userDetails)
      // const userDocRef = await this.firestore.collection('users').doc(uid);
      // userDocRef.set(userDetails);
      this.router.navigate(['/home']);
    } catch (error) {
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const data = await this.firestore.collection('users').snapshotChanges();
      data.subscribe((res) => {
        this.usersArray = [];
        res.map((data1) => {
          const value: any = data1.payload.doc.data();
          this.usersArray.push(value);
        });
        this.usersArray.forEach((res) => {
          this.allMails.push(res.email);
        });
      });
      // await this.firestore.collection('users').get().pipe(
      //   map(snapshot => {
      //     snapshot.forEach(doc => {
      //       users.push({ id: doc.id, ...doc.data() });
      //     });
      //   })
      // ).toPromise();
      // return users;
      // const allUsersRef = this.angularFireDatabase.list('/users');
      // const allUser = await allUsersRef.snapshotChanges();
      // await allUser.subscribe((res) => {
      //   res.map((res) => {
      //     const user = res.payload.val();
      //     this.usersArray.push(user);
      //   });
      //   this.usersArray.forEach((res) => {
      //     this.allMails.push(res.email);
      //   });
      // });
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
