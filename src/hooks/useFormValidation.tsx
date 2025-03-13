
import { useState } from 'react';
import { isValidEmail, isStrongPassword } from '@/utils/validation';

export const useFormValidation = (isLogin: boolean) => {
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
  }>({});

  const validateForm = (
    email: string,
    password: string,
    name?: string,
    passwordConfirm?: string
  ): boolean => {
    const newErrors: {
      name?: string;
      email?: string;
      password?: string;
      passwordConfirm?: string;
    } = {};
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      newErrors.email = "Email là bắt buộc";
      isValid = false;
    } else if (!isValidEmail(email)) {
      newErrors.email = "Email không hợp lệ";
      isValid = false;
    }

    // Password validation
    if (!password) {
      newErrors.password = "Mật khẩu là bắt buộc";
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = "Mật khẩu cần có ít nhất 6 ký tự";
      isValid = false;
    }

    // Registration specific validations
    if (!isLogin) {
      // Name validation
      if (!name?.trim()) {
        newErrors.name = "Họ tên là bắt buộc";
        isValid = false;
      } else if (name.length < 2) {
        newErrors.name = "Họ tên phải có ít nhất 2 ký tự";
        isValid = false;
      }

      // Password strength validation
      if (password && !isStrongPassword(password)) {
        newErrors.password = "Mật khẩu phải có ít nhất 1 chữ hoa và 1 số";
        isValid = false;
      }

      // Password confirmation
      if (password !== passwordConfirm) {
        newErrors.passwordConfirm = "Mật khẩu xác nhận không khớp";
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  return {
    errors,
    validateForm,
    setErrors
  };
};
