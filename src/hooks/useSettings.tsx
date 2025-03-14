import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { AIModel } from '@/utils/ai';

interface Settings {
  isStream: boolean;
  theme: 'light' | 'dark' | 'system';
  language: string;
  notificationsEnabled: boolean;
  model: AIModel;
  temperature: number;
  codeHighlighting: boolean;
  showAvatars: boolean;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Default settings
  const defaultSettings: Settings = {
    isStream: false,
    theme: 'system',
    language: 'vi',
    notificationsEnabled: true,
    model: 'gpt-4o-mini',
    temperature: 0.7,
    codeHighlighting: true,
    showAvatars: false,
  };

  useEffect(() => {
    if (!auth.currentUser) {
      // Use local storage for non-authenticated users
      const storedSettings = localStorage.getItem('app-settings');
      if (storedSettings) {
        try {
          setSettings(JSON.parse(storedSettings));
        } catch (error) {
          console.error("Error parsing settings:", error);
          setSettings(defaultSettings);
        }
      } else {
        setSettings(defaultSettings);
      }
      setLoading(false);
      return () => {};
    }

    // For authenticated users, use Firestore
    const userSettingsRef = doc(db, "users", auth.currentUser.uid, "settings", "preferences");
    
    // Subscribe to settings changes
    const unsubscribe = onSnapshot(userSettingsRef, (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as Settings);
      } else {
        // Initialize settings if they don't exist
        setDoc(userSettingsRef, defaultSettings)
          .catch(error => {
            console.error("Error creating default settings:", error);
            toast({
              title: "Lỗi",
              description: "Không thể tạo cài đặt mặc định",
              variant: "destructive",
            });
          });
        setSettings(defaultSettings);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error getting settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth.currentUser, toast]);

  // Function to update settings
  const updateSettings = async (newSettings: Partial<Settings>) => {
    if (!settings) return;
    
    const updatedSettings = { ...settings, ...newSettings };
    
    if (auth.currentUser) {
      // Update in Firestore for authenticated users
      const userSettingsRef = doc(db, "users", auth.currentUser.uid, "settings", "preferences");
      try {
        await setDoc(userSettingsRef, updatedSettings, { merge: true });
        toast({
          title: "Cài đặt đã được cập nhật",
          description: "Thay đổi của bạn đã được lưu",
        });
      } catch (error) {
        console.error("Error updating settings:", error);
        toast({
          title: "Lỗi",
          description: "Không thể cập nhật cài đặt",
          variant: "destructive",
        });
      }
    } else {
      // Update in localStorage for non-authenticated users
      localStorage.setItem('app-settings', JSON.stringify(updatedSettings));
      setSettings(updatedSettings);
      toast({
        title: "Cài đặt đã được cập nhật",
        description: "Thay đổi của bạn đã được lưu",
      });
    }
  };

  return { settings, loading, updateSettings };
};
