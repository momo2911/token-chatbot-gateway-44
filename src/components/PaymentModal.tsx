
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CreditCard, CheckCircle2, XCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { processPayment, ProcessPaymentParams } from "@/utils/payment";
import { useToast } from "@/hooks/use-toast";

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tokenAmount: number;
  price: number;
  onSuccess: (transactionId: string) => void;
}

type PaymentStep = 'form' | 'processing' | 'success' | 'error';

export function PaymentModal({ open, onOpenChange, tokenAmount, price, onSuccess }: PaymentModalProps) {
  const [step, setStep] = useState<PaymentStep>('form');
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const { toast } = useToast();

  const resetForm = () => {
    setCardNumber('');
    setCardName('');
    setExpiryDate('');
    setCvv('');
    setStep('form');
    setErrorMessage('');
  };

  const handleClose = () => {
    // If payment was successful, wait before closing
    if (step === 'success') {
      setTimeout(() => {
        onOpenChange(false);
        resetForm();
      }, 1500);
    } else {
      onOpenChange(false);
      resetForm();
    }
  };

  const validateForm = () => {
    if (!cardNumber.trim()) {
      setErrorMessage('Vui lòng nhập số thẻ');
      return false;
    }
    if (!cardName.trim()) {
      setErrorMessage('Vui lòng nhập tên chủ thẻ');
      return false;
    }
    if (!expiryDate.trim()) {
      setErrorMessage('Vui lòng nhập ngày hết hạn');
      return false;
    }
    if (!cvv.trim()) {
      setErrorMessage('Vui lòng nhập mã CVV');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setErrorMessage('');
    setStep('processing');
    
    try {
      const paymentParams: ProcessPaymentParams = {
        amount: price,
        tokens: tokenAmount,
        paymentMethod: 'credit_card'
      };
      
      const result = await processPayment(paymentParams);
      
      if (result.success && result.transactionId) {
        setTransactionId(result.transactionId);
        setStep('success');
        toast({
          title: "Thanh toán thành công",
          description: `Bạn đã mua ${tokenAmount} token`,
        });
        onSuccess(result.transactionId);
      } else {
        setStep('error');
        setErrorMessage(result.error || 'Thanh toán thất bại');
        toast({
          title: "Thanh toán thất bại",
          description: result.error || "Đã xảy ra lỗi trong quá trình thanh toán",
          variant: "destructive",
        });
      }
    } catch (error) {
      setStep('error');
      setErrorMessage('Đã xảy ra lỗi không mong muốn');
      console.error('Payment submission error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'form' && "Thanh toán mua token"}
            {step === 'processing' && "Đang xử lý thanh toán"}
            {step === 'success' && "Thanh toán thành công"}
            {step === 'error' && "Thanh toán thất bại"}
          </DialogTitle>
          <DialogDescription>
            {step === 'form' && `Mua ${tokenAmount} token với giá ${formatCurrency(price)}`}
            {step === 'processing' && "Vui lòng đợi trong khi chúng tôi xử lý giao dịch của bạn"}
            {step === 'success' && "Giao dịch của bạn đã được xử lý thành công"}
            {step === 'error' && "Đã xảy ra lỗi trong quá trình thanh toán"}
          </DialogDescription>
        </DialogHeader>

        {step === 'form' && (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="card-number">Số thẻ</Label>
                <Input
                  id="card-number"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="card-name">Tên chủ thẻ</Label>
                <Input
                  id="card-name"
                  placeholder="NGUYEN VAN A"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="expiry">Ngày hết hạn</Label>
                  <Input
                    id="expiry"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    type="password"
                    maxLength={4}
                  />
                </div>
              </div>
              
              {errorMessage && (
                <div className="text-sm text-destructive mt-2">{errorMessage}</div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" type="button" onClick={handleClose}>
                Hủy
              </Button>
              <Button type="submit">
                <CreditCard className="mr-2 h-4 w-4" />
                Thanh toán {formatCurrency(price)}
              </Button>
            </DialogFooter>
          </form>
        )}
        
        {step === 'processing' && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-center text-muted-foreground">
              Đang xử lý giao dịch của bạn. Vui lòng không đóng cửa sổ này.
            </p>
          </div>
        )}
        
        {step === 'success' && (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-center font-medium">Thanh toán thành công!</p>
            <p className="text-center text-muted-foreground mb-4">
              Bạn đã mua thành công {tokenAmount} token
            </p>
            <p className="text-xs text-muted-foreground">
              Mã giao dịch: {transactionId}
            </p>
            <Button className="mt-4" onClick={handleClose}>
              Đóng
            </Button>
          </div>
        )}
        
        {step === 'error' && (
          <div className="flex flex-col items-center justify-center py-8">
            <XCircle className="w-16 h-16 text-destructive mb-4" />
            <p className="text-center font-medium">Thanh toán thất bại</p>
            <p className="text-center text-muted-foreground mb-4">
              {errorMessage || "Đã xảy ra lỗi trong quá trình thanh toán"}
            </p>
            <div className="flex gap-4 mt-4">
              <Button variant="outline" onClick={handleClose}>
                Đóng
              </Button>
              <Button onClick={() => setStep('form')}>
                Thử lại
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
