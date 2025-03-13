
import React from 'react';

interface LockMessageProps {
  remainingTime: string;
}

const LockMessage = ({ remainingTime }: LockMessageProps) => {
  return (
    <div className="text-center p-4 mb-4 bg-destructive/10 rounded-lg">
      <p className="font-medium text-destructive mb-2">Tài khoản tạm khóa</p>
      <p className="text-sm text-muted-foreground">
        Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau {remainingTime}.
      </p>
    </div>
  );
};

export default LockMessage;
