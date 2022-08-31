export default class InviteProps {
  address: string;
  members: string[];
  permissions: number[];

  constructor(address: string, members: string[], permissions: number[]) {
    this.address = address;
    this.members = members;
    this.permissions = permissions;
  }

  getProps() {
    return [this.address, this.members, this.permissions];
  }
}
