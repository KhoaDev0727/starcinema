export const Regex = {
  PASSWORD: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, // At least 8 characters, letters, numbers & symbols
  PHONE: /^(0|\+84)[0-9]{9}$/,
  IDENTITY_CARD: /^[0-9]{9,12}$/,
  NAME: /^[a-zA-Z\sÀ-ỹ']{2,50}$/,
  EMAIL: /^[\w.+-]+@([\w-]+\.)+[\w-]{2,4}$/,
  EMAIL_OR_PHONE: /^[\w.+-]+@([\w-]+\.)+[\w-]{2,4}$|^(0|\+84)[0-9]{9}$/
};