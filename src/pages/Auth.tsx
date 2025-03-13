
import React from 'react';
import AuthCard from '@/components/auth/AuthCard';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import LockMessage from '@/components/auth/LockMessage';
import ResetPassword from '@/components/auth/ResetPassword';
import VerifyEmail from '@/components/auth/VerifyEmail';
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
    showResetPassword,
    showVerifyEmail,
    handleSubmit,
    createAdminUser,
    getRemainingLockTime,
    toggleAuthMode,
    handleForgotPassword,
    handleBackToLogin
  } = useAuth();

  // Define the card title and description based on current state
  let cardTitle = isLogin ? 'Đăng nhập An toàn' : 'Đăng ký tài khoản An toàn';
  let cardDescription = isLogin 
    ? 'Đăng nhập để sử dụng Token Gateway' 
    : 'Tạo tài khoản để bắt đầu sử dụng Token Gateway';

  if (showResetPassword) {
    cardTitle = 'Đặt lại mật khẩu';
    cardDescription = 'Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu';
  } else if (showVerifyEmail) {
    cardTitle = 'Xác thực Email';
    cardDescription = 'Kiểm tra hộp thư của bạn để xác thực tài khoản';
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-background to-accent/5">
      <div className="w-full max-w-md">
        <AuthCard
          title={cardTitle}
          description={cardDescription}
        >
          {isLocked ? (
            <LockMessage remainingTime={getRemainingLockTime()} />
          ) : showResetPassword ? (
            <ResetPassword
              onBackToLogin={handleBackToLogin}
            />
          ) : showVerifyEmail ? (
            <VerifyEmail
              email={email}
              onBackToLogin={handleBackToLogin}
            />
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
              onForgotPassword={handleForgotPassword}
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
          
          {!showResetPassword && !showVerifyEmail && (
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
          )}
        </AuthCard>
        
        <p className="text-center text-xs text-muted-foreground mt-4">
          Bằng việc đăng ký, bạn đồng ý với các <a href="#" className="text-accent hover:underline">Điều khoản Sử dụng</a> và <a href="#" className="text-accent hover:underline">Chính sách Bảo mật</a> của chúng tôi.
        </p>
      </div>
    </div>
  );
};

export default Auth;
