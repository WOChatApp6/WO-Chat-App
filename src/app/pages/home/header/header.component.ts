import { AfterContentInit, Component, Input, OnInit } from '@angular/core';
import { Logout } from '../../authentication/store/auth.action';
import { Store } from '@ngxs/store';
import { UserService } from '../../../services/user.service';
import { Observable } from 'rxjs';
import { SetCurrentUser, SetSelectedUser } from '../../../store/user.action';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, AfterContentInit {
  currentUser: any;
  currentUser$: Observable<any>;

  constructor(private store: Store, private userService: UserService) {
    this.currentUser$ = this.store.select((state) => state.user.currentUser);
    this.currentUser$.subscribe((res) => {
      if (res) {
        this.currentUser = res;
      }
    });
  }

  ngOnInit() {}

  ngAfterContentInit() {}

  logout() {
    this.store.dispatch(new Logout());
    this.store.dispatch(new SetCurrentUser(null));
    this.store.dispatch(new SetSelectedUser(null));
  }

  onChat() {
    this.store.dispatch(new SetSelectedUser(null));
  }
}
