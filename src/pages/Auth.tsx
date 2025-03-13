
import React from 'react';
import AuthCard from '@/components/auth/AuthCard';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import LockMessage from '@/components/auth/LockMessage';
import { useAuth } from '@/hooks/useAuth';

const Auth = () => {
  const {
    isLogin,
    isLoading,
    isLocked,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    passwordConfirm,
    setPasswordConfirm,
    errors,
    loginAttempts,
    MAX_LOGIN_ATTEMPTS,
    handleSubmit,
    createAdminUser,
    getRemainingLockTime,
    toggleAuthMode
  } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-accent/5">
      <div className="w-full max-w-md">
        <AuthCard
          title={isLogin ? 'Đăng nhập An toàn' : 'Đăng ký tài khoản An toàn'}
          description={isLogin 
            ? 'Đăng nhập để sử dụng Token Gateway' 
            : 'Tạo tài khoản để bắt đầu sử dụng Token Gateway'}
        >
          {isLocked ? (
            <LockMessage remainingTime={getRemainingLockTime()} />
          ) : isLogin ? (
            <LoginForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              errors={errors}
              isLoading={isLoading}
              loginAttempts={loginAttempts}
              MAX_LOGIN_ATTEMPTS={MAX_LOGIN_ATTEMPTS}
              handleSubmit={handleSubmit}
              createAdminUser={createAdminUser}
            />
          ) : (
            <SignupForm
              name={name}
              setName={setName}
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              passwordConfirm={passwordConfirm}
              setPasswordConfirm={setPasswordConfirm}
              errors={errors}
              isLoading={isLoading}
              handleSubmit={handleSubmit}
            />
          )}
          
          <div className="mt-6 text-center">
            <button
              onClick={toggleAuthMode}
              className="text-accent hover:underline text-sm transition-all-200"
              disabled={isLoading}
            >
              {isLogin 
                ? 'Chưa có tài khoản? Đăng ký ngay' 
                : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>
        </AuthCard>
        
        <p className="text-center text-xs text-muted-foreground mt-4">
          Bằng việc đăng ký, bạn đồng ý với các <a href="#" className="text-accent hover:underline">Điều khoản Sử dụng</a> và <a href="#" className="text-accent hover:underline">Chính sách Bảo mật</a> của chúng tôi.
        </p>
      </div>
    </div>
  );
};

export default Auth;
