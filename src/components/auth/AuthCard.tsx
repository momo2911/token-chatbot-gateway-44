
import React from 'react';
import { Shield } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const AuthCard = ({ title, description, children }: AuthCardProps) => {
  return (
    <Card className="w-full max-w-md bg-white rounded-2xl shadow-lg glass-card overflow-hidden transform transition-all-500 animate-scale-in">
      <CardHeader className="p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold shadow-md">
            <Shield className="h-6 w-6" />
          </div>
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">
            {title}
          </h1>
          
          <p className="text-muted-foreground mb-2">
            {description}
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="px-6 pb-6 sm:px-8 sm:pb-8">
        {children}
      </CardContent>
    </Card>
  );
};

export default AuthCard;
