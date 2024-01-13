import { AfterContentInit, Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from 'src/app/services/user.service';
import { Store } from '@ngxs/store';
import { SetCurrentUser } from '../../store/user.action';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements AfterContentInit {
  constructor(private store: Store, private userService: UserService) {
    this.userService.getCurrentUser().subscribe((res) => {
      if (res) {
        this.store.dispatch(new SetCurrentUser(res));
      }
    });
  }

  ngAfterContentInit(): void {}
}
