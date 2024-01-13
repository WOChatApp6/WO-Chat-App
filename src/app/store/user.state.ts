import { Action, Selector, State, StateContext } from '@ngxs/store';
import { Injectable } from '@angular/core';
import { SetCurrentUser, SetSelectedUser } from './user.action';

export interface UserStateModel {
  users: any[];
  currentUser: any;
  selectedUser: any;
}

@State<UserStateModel>({
  name: 'user',
  defaults: {
    users: [],
    currentUser: null,
    selectedUser: null,
  },
})
@Injectable()
export class UserState {
  constructor() {}

  @Selector()
  static user(state: UserStateModel): any {
    return state.users;
  }

  @Action(SetCurrentUser)
  async setCurrentUser(
    ctx: StateContext<UserStateModel>,
    payload: SetCurrentUser
  ) {
    ctx.patchState({ currentUser: payload.payload });
  }

  @Action(SetSelectedUser)
  async setSelectedUser(
    ctx: StateContext<UserStateModel>,
    payload: SetSelectedUser
  ) {
    ctx.patchState({ selectedUser: payload.payload });
  }
}
