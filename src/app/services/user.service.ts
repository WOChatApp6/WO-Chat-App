import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import {
  AngularFirestore,
  AngularFirestoreCollection,
} from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // public userData = new BehaviorSubject(null);
  // public currentUserData = new BehaviorSubject(null);

  constructor(
    private angularFireDatabase: AngularFireDatabase,
    private angularFireAuth: AngularFireAuth,
    private firestore: AngularFirestore
  ) {}



  getCurrentUser(): Observable<any> {
    return this.angularFireAuth.authState.pipe(
      switchMap((user) => {
        if (user) {
          const userId = user.uid;
          const contactsCollectionRef = this.firestore
            .collection('users')
            .doc(userId);
          return contactsCollectionRef.valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }
}
