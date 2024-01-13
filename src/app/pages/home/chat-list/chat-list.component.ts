import {AfterContentInit, Component, OnInit} from '@angular/core';
import {Store} from '@ngxs/store';
import {SetSelectedUser} from '../../../store/user.action';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import {AngularFireAuth} from '@angular/fire/compat/auth';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.css'],
})
export class ChatListComponent implements OnInit, AfterContentInit {
  searchQuery = '';
  searchResults: any[] = []; // Replace 'any' with your user data type
  usersArray: any[] = [];
  isFound: boolean = false;
  userId: string = '';
  currentUser: any;
  currentUser$: any;
  recentChatUsers: any[] = [];
  channels: any[] = [];
  processedUserIds = new Set<string>();
  latestMessages: Map<string, any> = new Map<string, any>();

  constructor(
    private store: Store,
    private firestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth,
  ) {
  }

  ngOnInit() {
    this.getAllUsers();
  }


  ngAfterContentInit() {
  }

  async getAllUsers() {
    try {
      await this.angularFireAuth.authState.subscribe((res) => {
        if (res) {
          this.userId = res.uid;
          this.fetchChatRooms();
        }
      });
      const data = await this.firestore.collection('users').snapshotChanges();
      data.subscribe((res) => {
        this.usersArray = [];
        if (this.userId) {
          res.map((data1) => {
            const value: any = data1.payload.doc.data();
            if (value.userId !== this.userId) {
              this.usersArray.push(value);
            }
          });
        }
      });
      // const currentUserId = localStorage.getItem('token');
      // const allUsersRef = this.angularFireDatabase.list('/users');
      // const allUsers = await allUsersRef.snapshotChanges();
      // await allUsers.subscribe((res) => {
      //   this.usersArray = [];
      //   const data = res.filter(res => res.key !== currentUserId);
      //   data.map((res) => {
      //     const user = res.payload.val();
      //     this.usersArray.push(user);
      //   });
      // });
    } catch (err) {
      console.log(err);
    }
  }

  onUser(user: any) {
    this.store.dispatch(new SetSelectedUser(user));
  }

  clearSearchInput() {
    this.searchQuery = '';
    this.isFound = false;
    this.onSearch();
  }

  onSearch() {
    if (this.searchQuery) {
      this.searchResults = this.usersArray.filter((user) =>
        user.name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
      if (this.searchResults.length === 0) {
        this.isFound = true;
      } else {
        this.isFound = false;
      }
    } else {
      this.searchResults = [];
    }
  }

  async fetchLastMessage(roomId: string) {
    this.firestore.collection(`channels/${roomId}/messages`, ref => ref.orderBy('timestamp', 'desc'))
      .valueChanges()
      .subscribe(async (messages: any[]) => {
        if (messages.length > 1) {
          const lastMessage = messages[0];
          const userId = lastMessage.senderId === this.userId ? lastMessage.receiverId : lastMessage.senderId;
          const existingUserIndex = this.recentChatUsers.findIndex(user => user.userId === userId);
          if (existingUserIndex !== -1) {
            this.recentChatUsers[existingUserIndex].lastMessage = lastMessage;
          } else {
            const data = await this.getUserDetails(userId);
            this.recentChatUsers.push({userId, lastMessage, data});
          }
          return;
        }
        if (messages.length === 1) {
          const lastMessage = messages[0];
          const userId = lastMessage.senderId === this.userId ? lastMessage.receiverId : lastMessage.senderId;
          if (!this.processedUserIds.has(userId)) {
            this.processedUserIds.add(userId);
            const existingUserIndex = this.recentChatUsers.findIndex(user => user.userId === userId);
            if (existingUserIndex !== -1) {
              this.recentChatUsers[existingUserIndex].lastMessage = lastMessage;
            } else {
              const data = await this.getUserDetails(userId);
              this.recentChatUsers.push({userId, lastMessage, data});
            }
          }
          return;
        }
      });
  }

  fetchChatRooms() {
    this.firestore.collection('channels', ref => ref.where('members', 'array-contains', this.userId))
      .snapshotChanges()
      .subscribe((rooms: any[]) => {
        this.channels = rooms;
        rooms.forEach((room) => {
          this.fetchLastMessage(room.payload.doc.id);
        })
      });
  }

  async getUserDetails(userId: string): Promise<any> {
    const userDocRef = this.firestore.doc(`users/${userId}`);
    const userSnapshot = await userDocRef.get().toPromise();

    if (userSnapshot && userSnapshot.exists) {
      return userSnapshot.data();
    } else {
      return null;
    }
  }

  compareDate(timestamp: any): string {
    if (!timestamp) {
      return new Date().toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: 'numeric'
      });
    } else {
      return new Date(timestamp.seconds * 1000).toLocaleTimeString('en-US', {
        hour12: true,
        hour: 'numeric',
        minute: 'numeric'
      });
    }
  }

}
