
import React from 'react';
import { ArrowRight } from 'lucide-react';
import FormInput from './FormInput';
import { Button } from '@/components/ui/button';

interface LoginFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  errors: {
    email?: string;
    password?: string;
  };
  isLoading: boolean;
  loginAttempts: number;
  MAX_LOGIN_ATTEMPTS: number;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  onForgotPassword: () => void;
}

const LoginForm = ({
  email,
  setEmail,
  password,
  setPassword,
  errors,
  isLoading,
  loginAttempts,
  MAX_LOGIN_ATTEMPTS,
  handleSubmit,
  onForgotPassword
}: LoginFormProps) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      
      <div className="space-y-1">
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
        
        <div className="text-right">
          <button 
            type="button"
            onClick={onForgotPassword}
            className="text-xs text-accent hover:underline"
            disabled={isLoading}
          >
            Quên mật khẩu?
          </button>
        </div>
      </div>
      
      {loginAttempts > 0 && (
        <div className="text-xs text-muted-foreground text-right">
          Số lần thử còn lại: {MAX_LOGIN_ATTEMPTS - loginAttempts}
        </div>
      )}
      
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            Đăng nhập
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
