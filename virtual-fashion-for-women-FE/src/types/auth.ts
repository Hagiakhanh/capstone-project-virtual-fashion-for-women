export type typeLogin = {
  email: string;
  password: string;
}

export type typeRegister = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type typeConfirmEmail = {
  email: string;
  confirmToken: string;
}