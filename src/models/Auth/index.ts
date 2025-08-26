export type SignInResponse = {
  data: {
    token: string;
    user: UserType;
  };
};

export type UserType = {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
  bio: string;
  location: string;
  website: string;
  profile_picture_url: string;
  date_of_birth: string;
  role_id: number;
  role: Role;
  description: string;
};

export type Role = {
  id: number;
  description: string;
  level: number;
  name: string;
};
