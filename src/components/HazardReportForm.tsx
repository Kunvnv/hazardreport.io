import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';
import { CameraComponent } from './Camera';
import { AlertTriangle, Send, RotateCcw, Upload } from 'lucide-react';
import { storage } from '@/lib/storage';
import { compressImage } from '@/lib/utils-extended';

interface HazardReportFormProps {
  onReportSubmitted: () => void;
}

export function HazardReportForm({ onReportSubmitted }: HazardReportFormProps) {
  const [formData, setFormData] = useState({
    reporter: '',
    location: '',
    urgency: 'medium' as 'low' | 'medium' | 'high',
    type: '',
    description: ''
  });
  
  const [capturedImage, setCapturedImage] = useState<string | undefined>();
  const [uploadedImage, setUploadedImage] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hazardTypes = [
    'Điện',
    'Hóa chất',
    'Cơ khí',
    'Môi trường',
    'Cháy nổ',
    'An toàn lao động',
    'Khác'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file ảnh",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 5MB",
        variant: "destructive"
      });
      return;
    }

    try {
      const compressedImage = await compressImage(file);
      setUploadedImage(compressedImage);
      setCapturedImage(undefined);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xử lý ảnh",
        variant: "destructive"
      });
    }
  };

  const handleCameraCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setUploadedImage(undefined);
  };

  const handleImageRemove = () => {
    setCapturedImage(undefined);
    setUploadedImage(undefined);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!formData.reporter.trim() || !formData.location.trim() || !formData.type || !formData.description.trim()) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive"
      });
      return;
    }

    if (!capturedImage && !uploadedImage) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chụp hoặc tải lên ảnh mối nguy hiểm",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const newReport = storage.addReport({
        reporter: formData.reporter.trim(),
        location: formData.location.trim(),
        urgency: formData.urgency,
        type: formData.type,
        description: formData.description.trim(),
        image: capturedImage || uploadedImage,
        imageType: capturedImage ? 'camera' : 'upload',
        date: new Date().toLocaleDateString('vi-VN'),
        status: 'pending'
      });

      toast({
        title: "Thành công",
        description: `Báo cáo #${newReport.id} đã được gửi thành công!`
      });

      // Reset form
      setFormData({
        reporter: '',
        location: '',
        urgency: 'medium',
        type: '',
        description: ''
      });
      
      handleImageRemove();
      onReportSubmitted();

    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể gửi báo cáo. Vui lòng thử lại.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      reporter: '',
      location: '',
      urgency: 'medium',
      type: '',
      description: ''
    });
    handleImageRemove();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          Tạo Báo Cáo Mối Nguy Mới
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reporter">Họ tên người báo cáo *</Label>
              <Input
                id="reporter"
                value={formData.reporter}
                onChange={(e) => handleInputChange('reporter', e.target.value)}
                placeholder="Nhập họ tên của bạn"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Vị trí xảy ra *</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ví dụ: Tầng 2, phòng sản xuất A"
                required
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Mức độ nghiêm trọng</Label>
            <RadioGroup
              value={formData.urgency}
              onValueChange={(value) => handleInputChange('urgency', value)}
              className="flex space-x-6"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="urgency-low" />
                <Label htmlFor="urgency-low">Thấp</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="urgency-medium" />
                <Label htmlFor="urgency-medium">Trung bình</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="urgency-high" />
                <Label htmlFor="urgency-high">Cao</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hazard-type">Loại rủi ro *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger>
                <SelectValue placeholder="-- Chọn loại rủi ro --" />
              </SelectTrigger>
              <SelectContent>
                {hazardTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả chi tiết mối nguy *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Mô tả chi tiết về mối nguy hiểm..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="space-y-4">
            <Label>Hình ảnh minh họa *</Label>
            <Tabs defaultValue="camera" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="camera">Chụp ảnh</TabsTrigger>
                <TabsTrigger value="upload">Tải ảnh lên</TabsTrigger>
              </TabsList>
              
              <TabsContent value="camera" className="mt-4">
                <CameraComponent
                  onImageCapture={handleCameraCapture}
                  onImageRemove={handleImageRemove}
                  capturedImage={capturedImage}
                />
              </TabsContent>
              
              <TabsContent value="upload" className="mt-4">
                <Card>
                  <CardContent className="p-4">
                    {uploadedImage ? (
                      <div className="relative">
                        <img
                          src={uploadedImage}
                          alt="Ảnh đã tải lên"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-2 right-2"
                          onClick={handleImageRemove}
                        >
                          ×
                        </Button>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 mb-2">Kéo thả ảnh vào đây hoặc</p>
                        <Button type="button" variant="outline" asChild>
                          <label htmlFor="file-upload" className="cursor-pointer">
                            Chọn ảnh từ máy
                          </label>
                        </Button>
                        <input
                          id="file-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                          Hỗ trợ: JPG, PNG, GIF - Tối đa 5MB
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={handleReset} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Đặt lại
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Đang gửi...' : 'Gửi Báo Cáo'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}