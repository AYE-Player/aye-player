export interface IRole {
  Id: string;
  Name: string;
}

export interface IUserInfoDto {
  Id: string;
  Avatar: string;
  Email: string;
  Username: string;
  Roles: IRole[];
}
