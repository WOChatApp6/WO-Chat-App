export class SetCurrentUser {
  static readonly type = '[User] CurrentUser';
  constructor(public payload: any) {}
}

export class SetSelectedUser {
  static readonly type = '[User] SelectedUser';
  constructor(public payload: any) {
  }
}
