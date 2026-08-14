export type Profile = {
  display_name: string;
  bio: string;
  interests: string;
  member_status: string;
  email?: string;
};

export type ProfileStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

export type FieldProps = {
  label: string;
  value: string;
  multiline?: boolean;
  onChange: (value: string) => void;
};
