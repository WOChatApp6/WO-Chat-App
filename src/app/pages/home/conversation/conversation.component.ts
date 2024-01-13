import {AfterContentInit, Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {UserService} from '../../../services/user.service';
import {Observable} from 'rxjs';
import {Store} from '@ngxs/store';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import firebase from 'firebase/compat/app';
import * as moment from 'moment';
import {AngularFireStorage} from "@angular/fire/compat/storage";


@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css'],
})

export class ConversationComponent implements OnInit, AfterContentInit {
  activeUserChat: any;
  currentUser: any;
  currentUser$: Observable<any>;
  selectedUser$: Observable<any>;
  message: string | number | any = null;
  userId: any;
  messagesArray: any = [];
  monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  daysName = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
  today = new Date().toISOString().split('T')[0];
  isTodayTagDisplay = true;

  @ViewChild('mediaFileUploader') mediaFileUploader!: ElementRef;
  mediaList: any = [];
  displayMediaList: any[] = [];

  currentSlide: number = 0;
  showItemCount: number = 1;
  uploadedMedia: any[] = [];


  constructor(private userService: UserService, private store: Store, private firestore: AngularFirestore, private angularFireStorage:AngularFireStorage
  ) {
    this.currentUser$ = this.store.select((state) => state.user.currentUser);
    this.selectedUser$ = this.store.select((state) => state.user.selectedUser);
    this.currentUser$.subscribe((res) => {
      this.currentUser = res;
    });
    this.selectedUser$.subscribe((user) => {
      this.activeUserChat = user;
      if (this.activeUserChat) {
        const roomId = this.createChatRoom(this.activeUserChat.userId);
        roomId.then((channelId) => {
          if (channelId) {
            this.fetchMessages(channelId);
          }
        })
      }
    });

  }

  ngOnInit() {
  }

  ngAfterContentInit(): void {
  }

  fetchMessages(roomId: any) {
    this.firestore.collection(`channels/${roomId}/messages`, ref => ref.orderBy('timestamp'))
      .valueChanges()
      .subscribe((messages: any[]) => {
        this.messagesArray = messages;
      });
  }

  async createChatRoom(receiverId: string): Promise<string> {
    const roomMembers = [this.currentUser.userId, receiverId].sort();
    const roomId = roomMembers.join('_');
    const chatRoom: any = {
      roomId,
      members: roomMembers,
    };

    const userDocRef = this.firestore.collection('channels');
    userDocRef.doc(roomId).set(chatRoom)
    return roomId;
  }


  async uploadMediaToStorage(
    file: File,
    contentType: string,
    userId: string,
    fileNameWithTimestamp?: string
  ): Promise<string | null> {
    try {
      const storageRef = firebase.storage().ref();
      const mediaPath = `uploads/${contentType}/mpdm-channel/${userId}`;
      let fileRef: firebase.storage.Reference;

      if (fileNameWithTimestamp) {
        fileRef = storageRef.child(`${mediaPath}/${fileNameWithTimestamp}`);
      } else {
        fileRef = storageRef.child(`${mediaPath}/${file.name}`);
      }
      await fileRef.put(file);
      const mediaUrl = await fileRef.getDownloadURL();
      return mediaUrl;
    } catch (error) {
      return null;
    }
  }

  async uploadMediaAndGetUrls(): Promise<any> {
    for (const mediaFile of this.mediaList) {
      let contentType: string = '';
      const file = `${Date.now()}_${mediaFile.name}`;
      if (mediaFile.type.startsWith('image')) {
        contentType = 'image';
      } else if (mediaFile.type.startsWith('video')) {
        contentType = 'video';
      }
      const mediaUrl = await this.uploadMediaToStorage(
        mediaFile,
        contentType,
        this.currentUser.userId,
        file
      );
      if (mediaUrl) {
        this.uploadedMedia.push({
          url: mediaUrl,
          size: mediaFile.size,
          contentType: mediaFile.type
        });
      }
    }
  }

  async onSendMessage() {
   await this.uploadMediaAndGetUrls();
    if (this.message || this.displayMediaList.length) {
      const messageData: any = {
        senderId: this.currentUser.userId,
        receiverId: this.activeUserChat.userId,
        content: this.message,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        medias: this.uploadedMedia || []
      };
      console.log(messageData, 'message data')
      const roomId = this.createChatRoom(this.activeUserChat.userId);
      roomId.then((channelId: any) => {
        this.firestore.collection(`channels/${channelId}/messages`).add(messageData)
          .then((docRef) => {
            const messageId = docRef.id;
            messageData.key = messageId;
            this.firestore.collection(`channels/${channelId}/messages`).doc(messageId).set(messageData, {merge: true});
          })
          .catch((error) => {
            console.log('error')
          });
      })
      this.mediaList = [];
      this.displayMediaList = [];
      this.uploadedMedia = [];
      this.message = null;
    }
      // else {
    // }
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

  onMessage(message: any) {
    console.log(message, 'clicked message')
  }

  onUploadMediaFiles(event: any) {
    event.preventDefault();
    this.mediaFileUploader.nativeElement.click();
  }

  //
  getConvertedMedia(): { type: string; url: string }[] {
    return this.mediaList.map((file: any) => {
      const contentType = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'unknown';
      const url = URL.createObjectURL(file);
      return {contentType, url};
    });
  }

  uploadMediaFiles(event: any) {
    this.mediaList = Array.from(event.target.files);
    const data = this.getConvertedMedia();
    this.displayMediaList = data;
  }

  onClickMediaFile(index: number) {
    console.log(index, 'on media click');
  }

  // next(event:any) {
  //   console.log(event, 'from next')
  //   event.preventDefault();
  //   if (this.displayMediaList.length > 1) {
  //     if (this.currentSlide + Number(this.showItemCount) === this.displayMediaList.length) {
  //       let arr = this.displayMediaList.toArray();
  //       let first = arr.shift();
  //       arr = arr.concat([first]);
  //       this.displayMediaList.reset(arr);
  //       this.currentSlide--;
  //     }
  //     this.currentSlide = (this.currentSlide + 1) % this.displayMediaList.length;
  //   }
  // }

  next(event: any) {
    event.preventDefault();

    if (this.displayMediaList.length > 1) {
      if (this.currentSlide + Number(this.showItemCount) === this.displayMediaList.length) {
        const arr = [...this.displayMediaList];
        const first = arr.shift();
        arr.push(first);
        this.displayMediaList = arr;
        this.currentSlide = this.displayMediaList.length - Number(this.showItemCount);
      } else {
        this.currentSlide = (this.currentSlide + 1) % this.displayMediaList.length;
      }
    }
  }


  prev(event: any) {
    event.preventDefault();

    if (this.displayMediaList.length > 1) {
      if (this.currentSlide === 0) {
        const arr = [...this.displayMediaList];
        const last = arr.pop();
        arr.unshift(last);
        this.displayMediaList = arr;
        this.currentSlide = 1;
      } else {
        this.currentSlide = (this.currentSlide - 1 + this.displayMediaList.length) % this.displayMediaList.length;
      }
    }
  }


  // prev(event:any) {
  //   console.log(event,'from prev')
  //   event.preventDefault();
  //   if (this.displayMediaList.length > 1) {
  //     if (this.currentSlide == 0) {
  //       // let arr = this.displayMediaList.toArray();
  //       // let last = arr.pop();
  //       // arr = [last].concat(arr);
  //       // this.displayMediaList.reset(arr);
  //       this.currentSlide++;
  //     }
  //
  //     this.currentSlide = (this.currentSlide - 1 + this.displayMediaList.length) % this.displayMediaList.length;
  //   }
  // }


  removeMedia(index: number) {
    this.mediaList.splice(index, 1);
    this.displayMediaList.splice(index, 1);
    this.mediaFileUploader.nativeElement.value = '';
  }

  // getSafeUrl(file: File): SafeUrl {
  //   const url = URL.createObjectURL(file);
  //   return this.sanitizer.bypassSecurityTrustUrl(url);
  // }

  trackByFn(index: number, message: any) {
    return message.key;
  }

  selectDate(i: number): boolean {
    if (i === 0) {
      return true;
    }

    const currentDate = this.getFormattedDate(this.messagesArray[i].timestamp);
    const previousDate = this.getFormattedDate(this.messagesArray[i - 1].timestamp);

    return currentDate !== previousDate;
  }

  getFormattedDate(timestamp: any): string {
    if (!timestamp) {
      return this.today;
    }

    const date = new Date(timestamp.seconds * 1000);
    return date.toISOString().split('T')[0];
  }

  messageHeader(createdAt: any): string {
    if (!createdAt) {
      this.isTodayTagDisplay = false;
      return 'Today';
    }

    const date = this.getFormattedDate(createdAt);
    const diff = moment(this.today).diff(moment(date), 'days');

    if (diff === 0) {
      return 'Today';
    } else if (diff === 1) {
      return 'Yesterday';
    } else if (2 <= diff && diff <= 6) {
      return this.daysName[new Date(createdAt.seconds * 1000).getDay()];
    } else {
      return (
        this.daysName[new Date(createdAt.seconds * 1000).getDay()] +
        ', ' +
        this.monthNames[new Date(createdAt.seconds * 1000).getMonth()] +
        ' ' +
        new Date(createdAt.seconds * 1000).getDate()
      );
    }
  }
}
