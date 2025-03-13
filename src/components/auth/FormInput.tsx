
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FormInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

const FormInput = ({ 
  id, 
  label, 
  value, 
  onChange, 
  type = 'text', 
  placeholder, 
  error, 
  required = false,
  disabled = false
}: FormInputProps) => {
  return (
    <div>
      <Label htmlFor={id} className="block font-medium mb-1">
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`w-full ${error ? 'border-destructive' : ''}`}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      {error && (
        <p className="text-destructive text-xs mt-1 flex items-center">
          <AlertCircle className="h-3 w-3 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};

export default FormInput;
