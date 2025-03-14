
import React from 'react';
import { Layout } from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ModelSelector } from '@/components/ModelSelector';
import { useSettings } from '@/hooks/useSettings';

const Settings = () => {
  const { settings, updateSettings } = useSettings();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Cài đặt</h1>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tùy chọn AI</CardTitle>
              <CardDescription>
                Điều chỉnh cài đặt mô hình AI và kiểu trò chuyện
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="model">Mô hình AI</Label>
                <ModelSelector
                  value={settings?.model || 'gpt-4o-mini'}
                  onValueChange={(value) => updateSettings({ model: value })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="streaming">Phản hồi theo luồng</Label>
                  <p className="text-sm text-muted-foreground">
                    Hiển thị phản hồi của AI theo từng ký tự một
                  </p>
                </div>
                <Switch
                  id="streaming" 
                  checked={settings?.isStream || false}
                  onCheckedChange={(checked) => updateSettings({ isStream: checked })}
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="temperature">Độ sáng tạo</Label>
                <Select
                  value={String(settings?.temperature || 0.7)}
                  onValueChange={(value) => updateSettings({ temperature: parseFloat(value) })}
                >
                  <SelectTrigger id="temperature">
                    <SelectValue placeholder="Chọn độ sáng tạo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.1">Ít sáng tạo (0.1)</SelectItem>
                    <SelectItem value="0.5">Tiêu chuẩn (0.5)</SelectItem>
                    <SelectItem value="0.7">Cân bằng (0.7)</SelectItem>
                    <SelectItem value="1">Sáng tạo (1.0)</SelectItem>
                    <SelectItem value="1.5">Rất sáng tạo (1.5)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Giá trị cao hơn sẽ tạo ra phản hồi đa dạng hơn, nhưng có thể kém chính xác.
                  Giá trị thấp hơn sẽ tạo ra phản hồi nhất quán hơn.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hiển thị</CardTitle>
              <CardDescription>
                Cài đặt hiển thị và giao diện người dùng
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="code-highlighting">Tô màu mã nguồn</Label>
                  <p className="text-sm text-muted-foreground">
                    Tự động tô màu cú pháp cho các đoạn mã
                  </p>
                </div>
                <Switch
                  id="code-highlighting" 
                  checked={settings?.codeHighlighting || true}
                  onCheckedChange={(checked) => updateSettings({ codeHighlighting: checked })}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="avatar-display">Hiển thị avatar</Label>
                  <p className="text-sm text-muted-foreground">
                    Hiển thị avatar bên cạnh mỗi tin nhắn
                  </p>
                </div>
                <Switch
                  id="avatar-display" 
                  checked={settings?.showAvatars || false}
                  onCheckedChange={(checked) => updateSettings({ showAvatars: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
