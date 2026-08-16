export type SignInResponse = {
  data: {
    token: string;
    refresh_token: string;
    user: UserType;
  };
};

export type UserType = {
  id: number;
  username: string;
  email: string;
  website: string;
  profile_picture_url: string;
  date_of_birth: string;
  role_id: number;
  role: Role;
  description: string;
  created_at: string;
  updated_at: string;
  layer8_metadata: Layer8Metadata;
};

export type Layer8Metadata = {
  display_name: string;
  bio: string;
  favorite_color: string;
  is_email_verified: boolean;
  location: string;
  updated_at: string;
}

export type Role = {
  id: number;
  description: string;
  level: number;
  name: string;
};
