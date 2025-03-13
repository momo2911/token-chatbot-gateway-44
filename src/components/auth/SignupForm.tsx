
import React from 'react';
import { ArrowRight } from 'lucide-react';
import FormInput from './FormInput';
import { Button } from '@/components/ui/button';

interface SignupFormProps {
  name: string;
  setName: (name: string) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  passwordConfirm: string;
  setPasswordConfirm: (passwordConfirm: string) => void;
  errors: {
    name?: string;
    email?: string;
    password?: string;
    passwordConfirm?: string;
  };
  isLoading: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

const SignupForm = ({
  name,
  setName,
  email,
  setEmail,
  password,
  setPassword,
  passwordConfirm,
  setPasswordConfirm,
  errors,
  isLoading,
  handleSubmit
}: SignupFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormInput
        id="name"
        label="Họ tên"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Nguyễn Văn A"
        error={errors.name}
        required
        disabled={isLoading}
      />
      
      <FormInput
        id="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="email@example.com"
        error={errors.email}
        required
        disabled={isLoading}
      />
      
      <FormInput
        id="password"
        label="Mật khẩu"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="••••••••"
        error={errors.password}
        required
        disabled={isLoading}
      />
      
      <FormInput
        id="passwordConfirm"
        label="Xác nhận mật khẩu"
        value={passwordConfirm}
        onChange={(e) => setPasswordConfirm(e.target.value)}
        type="password"
        placeholder="••••••••"
        error={errors.passwordConfirm}
        required
        disabled={isLoading}
      />
      
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            Đăng ký
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
};

export default SignupForm;
