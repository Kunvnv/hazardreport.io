import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  User, 
  Calendar,
  Target,
  Edit,
  Trash2
} from 'lucide-react';
import { storage, ActionPlan as ActionPlanType, HazardReport } from '@/lib/storage';
import { getStatusColor, getStatusText, formatDate } from '@/lib/utils-extended';

interface ActionPlanProps {
  actions: ActionPlanType[];
  reports: HazardReport[];
  onRefresh: () => void;
}

export function ActionPlan({ actions, reports, onRefresh }: ActionPlanProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee: '',
    startDate: '',
    dueDate: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const reportsWithoutActions = reports.filter(report => 
    report.status === 'pending' && !actions.some(action => action.reportId === report.id)
  );

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateAction = async () => {
    if (!selectedReportId || !formData.title.trim() || !formData.assignee.trim() || !formData.dueDate) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive"
      });
      return;
    }

    try {
      storage.addAction({
        reportId: selectedReportId,
        title: formData.title.trim(),
        description: formData.description.trim(),
        assignee: formData.assignee.trim(),
        startDate: formData.startDate || new Date().toLocaleDateString('vi-VN'),
        dueDate: new Date(formData.dueDate).toLocaleDateString('vi-VN'),
        status: 'pending',
        priority: formData.priority
      });

      // Update report status to in-progress
      storage.updateReport(selectedReportId, { status: 'in-progress' });

      toast({
        title: "Thành công",
        description: "Hành động khắc phục đã được tạo thành công!"
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        assignee: '',
        startDate: '',
        dueDate: '',
        priority: 'medium'
      });
      setSelectedReportId(null);
      setIsCreateDialogOpen(false);
      onRefresh();

    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể tạo hành động. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = (actionId: number, newStatus: string) => {
    storage.updateAction(actionId, { status: newStatus as 'pending' | 'in-progress' | 'completed' | 'overdue' });
    
    // If action is completed, check if we should update the report status
    if (newStatus === 'completed') {
      const action = actions.find(a => a.id === actionId);
      if (action) {
        const relatedActions = actions.filter(a => a.reportId === action.reportId);
        const allCompleted = relatedActions.every(a => a.id === actionId || a.status === 'completed');
        
        if (allCompleted) {
          storage.updateReport(action.reportId, { status: 'completed' });
        }
      }
    }
    
    onRefresh();
  };

  const handleDeleteAction = (actionId: number) => {
    if (confirm('Bạn có chắc chắn muốn xóa hành động này?')) {
      storage.deleteAction(actionId);
      onRefresh();
      toast({
        title: "Thành công",
        description: "Hành động đã được xóa"
      });
    }
  };

  const getActionsByStatus = (status: string) => {
    return actions.filter(action => action.status === status);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng số</p>
                <p className="text-2xl font-bold">{actions.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Đang thực hiện</p>
                <p className="text-2xl font-bold">{getActionsByStatus('in-progress').length}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Hoàn thành</p>
                <p className="text-2xl font-bold">{getActionsByStatus('completed').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Quá hạn</p>
                <p className="text-2xl font-bold">{getActionsByStatus('overdue').length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Action Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý hành động khắc phục</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Tạo hành động mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo hành động khắc phục mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Chọn báo cáo cần xử lý</Label>
                <Select value={selectedReportId?.toString() || ''} onValueChange={(value) => setSelectedReportId(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Chọn báo cáo --" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportsWithoutActions.map((report) => (
                      <SelectItem key={report.id} value={report.id.toString()}>
                        #{report.id} - {report.location} - {report.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="action-title">Tiêu đề hành động *</Label>
                <Input
                  id="action-title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Nhập tiêu đề hành động"
                />
              </div>

              <div>
                <Label htmlFor="action-description">Mô tả chi tiết</Label>
                <Textarea
                  id="action-description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Mô tả chi tiết về hành động cần thực hiện"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assignee">Người phụ trách *</Label>
                  <Input
                    id="assignee"
                    value={formData.assignee}
                    onChange={(e) => handleInputChange('assignee', e.target.value)}
                    placeholder="Tên người phụ trách"
                  />
                </div>

                <div>
                  <Label>Mức độ ưu tiên</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Thấp</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="high">Cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Ngày bắt đầu</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="due-date">Hạn hoàn thành *</Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => handleInputChange('dueDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                  Hủy
                </Button>
                <Button onClick={handleCreateAction} className="flex-1">
                  Tạo hành động
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Actions List */}
      <div className="space-y-4">
        {actions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Chưa có hành động nào</p>
              <p>Tạo hành động khắc phục cho các báo cáo mối nguy</p>
            </CardContent>
          </Card>
        ) : (
          actions.map((action) => {
            const relatedReport = reports.find(r => r.id === action.reportId);
            return (
              <Card key={action.id} className={`${action.status === 'overdue' ? 'border-red-200' : ''}`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(action.status)}>
                          {getStatusText(action.status)}
                        </Badge>
                        <Badge variant="outline">
                          {action.priority === 'high' ? 'Cao' : 
                           action.priority === 'medium' ? 'Trung bình' : 'Thấp'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">HĐ-{action.id}</span>
                      </div>

                      <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                      
                      {action.description && (
                        <p className="text-muted-foreground mb-3">{action.description}</p>
                      )}

                      {relatedReport && (
                        <div className="bg-gray-50 p-3 rounded-lg mb-3">
                          <p className="text-sm font-medium">Báo cáo liên quan: #{relatedReport.id}</p>
                          <p className="text-sm text-muted-foreground">{relatedReport.location} - {relatedReport.type}</p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{action.assignee}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Bắt đầu: {action.startDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>Hạn: {action.dueDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4 text-muted-foreground" />
                          <span>Ưu tiên: {action.priority === 'high' ? 'Cao' : action.priority === 'medium' ? 'TB' : 'Thấp'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Select 
                        value={action.status} 
                        onValueChange={(value) => handleStatusUpdate(action.id, value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Chờ xử lý</SelectItem>
                          <SelectItem value="in-progress">Đang thực hiện</SelectItem>
                          <SelectItem value="completed">Hoàn thành</SelectItem>
                          <SelectItem value="overdue">Quá hạn</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAction(action.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pending Reports */}
      {reportsWithoutActions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Báo cáo chưa có hành động khắc phục ({reportsWithoutActions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reportsWithoutActions.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">#{report.id} - {report.type}</p>
                    <p className="text-sm text-muted-foreground">{report.location} - {report.reporter}</p>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setSelectedReportId(report.id);
                      setIsCreateDialogOpen(true);
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Tạo hành động
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}