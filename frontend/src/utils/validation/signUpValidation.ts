/** 名前のバリデーション（3〜30文字） */
export const validateName = (name: string): boolean => {
  return name.length >= 3 && name.length <= 30;
};

/** メールアドレスのバリデーション */
export const validateEmail = (email: string): boolean => {
  const regex = /^[A-Za-z0-9]{1}[A-Za-z0-9_.-]*@{1}[A-Za-z0-9_.-]+[.][A-Za-z0-9]+$/;
  return regex.test(email);
};

/** パスワードのバリデーション（大文字・文字数・数字を含むか） */
export const validatePassword = (password: string) => {
  const hasUppercase = /[A-Z]+/.test(password);
  const isValidLength = /^.{8,24}$/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return {
    hasUppercase,
    isValidLength,
    hasNumber,
    isValid: hasUppercase && isValidLength && hasNumber,
  };
};
