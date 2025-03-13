
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useLoginAttempts = () => {
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState<number | null>(null);
  const { toast } = useToast();

  const MAX_LOGIN_ATTEMPTS = 5;
  const LOCK_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds
  
  useEffect(() => {
    // Check for stored lock time
    const storedLockTime = localStorage.getItem('auth_lock_time');
    if (storedLockTime) {
      const lockTimeValue = parseInt(storedLockTime, 10);
      if (lockTimeValue > Date.now()) {
        setIsLocked(true);
        setLockTime(lockTimeValue);
      } else {
        // Lock expired
        localStorage.removeItem('auth_lock_time');
        localStorage.removeItem('login_attempts');
      }
    }

    // Get stored login attempts
    const storedAttempts = localStorage.getItem('login_attempts');
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts, 10));
    }

    // Lock countdown timer
    let interval: number | undefined;
    if (isLocked && lockTime) {
      interval = window.setInterval(() => {
        if (lockTime <= Date.now()) {
          setIsLocked(false);
          localStorage.removeItem('auth_lock_time');
          localStorage.removeItem('login_attempts');
          setLoginAttempts(0);
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLocked, lockTime]);

  const incrementLoginAttempts = () => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    localStorage.setItem('login_attempts', newAttempts.toString());

    if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockUntil = Date.now() + LOCK_DURATION;
      setIsLocked(true);
      setLockTime(lockUntil);
      localStorage.setItem('auth_lock_time', lockUntil.toString());
    }
  };

  const resetLoginAttempts = () => {
    localStorage.removeItem('login_attempts');
    setLoginAttempts(0);
  };

  const checkLockStatus = () => {
    if (isLocked) {
      toast({
        title: "Tài khoản tạm khóa",
        description: "Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      return true;
    }
    return false;
  };

  // Calculate remaining lock time in minutes and seconds
  const getRemainingLockTime = (): string => {
    if (!lockTime) return '';
    
    const remainingMs = Math.max(0, lockTime - Date.now());
    const minutes = Math.floor(remainingMs / 60000);
    const seconds = Math.floor((remainingMs % 60000) / 1000);
    
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return {
    loginAttempts,
    isLocked,
    MAX_LOGIN_ATTEMPTS,
    incrementLoginAttempts,
    resetLoginAttempts,
    checkLockStatus,
    getRemainingLockTime
  };
};
