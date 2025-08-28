import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Search, 
  Filter, 
  Eye, 
  Plus, 
  MapPin, 
  User, 
  Calendar,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { storage, HazardReport } from '@/lib/storage';
import { getStatusColor, getUrgencyColor, getStatusText, getUrgencyText, formatDate, searchInObject } from '@/lib/utils-extended';

interface ReportsListProps {
  reports: HazardReport[];
  onCreateAction: (reportId: number) => void;
  onRefresh: () => void;
}

export function ReportsList({ reports, onCreateAction, onRefresh }: ReportsListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedReport, setSelectedReport] = useState<HazardReport | null>(null);

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesSearch = searchQuery === '' || searchInObject(report, searchQuery);
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
      const matchesUrgency = urgencyFilter === 'all' || report.urgency === urgencyFilter;
      const matchesType = typeFilter === 'all' || report.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesUrgency && matchesType;
    });
  }, [reports, searchQuery, statusFilter, urgencyFilter, typeFilter]);

  const uniqueTypes = useMemo(() => {
    return Array.from(new Set(reports.map(r => r.type))).filter(Boolean);
  }, [reports]);

  const handleStatusUpdate = (reportId: number, newStatus: string) => {
    storage.updateReport(reportId, { status: newStatus as 'pending' | 'in-progress' | 'completed' | 'overdue' });
    onRefresh();
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Lọc và Tìm kiếm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="pending">Chờ xử lý</SelectItem>
                <SelectItem value="in-progress">Đang xử lý</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="overdue">Quá hạn</SelectItem>
              </SelectContent>
            </Select>

            <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Mức độ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả mức độ</SelectItem>
                <SelectItem value="high">Cao</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="low">Thấp</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Loại rủi ro" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại</SelectItem>
                {uniqueTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setUrgencyFilter('all');
                setTypeFilter('all');
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Danh sách báo cáo ({filteredReports.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Không tìm thấy báo cáo nào</p>
              <p>Thử thay đổi bộ lọc hoặc tạo báo cáo mới</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getUrgencyColor(report.urgency)}>
                          {getUrgencyText(report.urgency)}
                        </Badge>
                        <Badge className={getStatusColor(report.status)}>
                          {getStatusText(report.status)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">#{report.id}</span>
                      </div>
                      
                      <h3 className="font-medium text-lg mb-2">{report.type}</h3>
                      <p className="text-muted-foreground mb-3 line-clamp-2">{report.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{report.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{report.reporter}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{report.date}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                            <Eye className="h-4 w-4 mr-1" />
                            Xem
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Chi tiết báo cáo #{report.id}</DialogTitle>
                          </DialogHeader>
                          {selectedReport && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Người báo cáo</label>
                                  <p>{selectedReport.reporter}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Ngày báo cáo</label>
                                  <p>{selectedReport.date}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Vị trí</label>
                                  <p>{selectedReport.location}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Loại rủi ro</label>
                                  <p>{selectedReport.type}</p>
                                </div>
                              </div>
                              
                              <div className="flex gap-2">
                                <Badge className={getUrgencyColor(selectedReport.urgency)}>
                                  {getUrgencyText(selectedReport.urgency)}
                                </Badge>
                                <Badge className={getStatusColor(selectedReport.status)}>
                                  {getStatusText(selectedReport.status)}
                                </Badge>
                              </div>
                              
                              <div>
                                <label className="text-sm font-medium text-muted-foreground">Mô tả chi tiết</label>
                                <p className="mt-1">{selectedReport.description}</p>
                              </div>
                              
                              {selectedReport.image && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Hình ảnh</label>
                                  <img 
                                    src={selectedReport.image} 
                                    alt="Hình ảnh mối nguy" 
                                    className="mt-2 max-w-full h-auto rounded-lg border"
                                  />
                                </div>
                              )}
                              
                              <div className="flex gap-2 pt-4">
                                <Select 
                                  value={selectedReport.status} 
                                  onValueChange={(value) => handleStatusUpdate(selectedReport.id, value)}
                                >
                                  <SelectTrigger className="w-48">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Chờ xử lý</SelectItem>
                                    <SelectItem value="in-progress">Đang xử lý</SelectItem>
                                    <SelectItem value="completed">Hoàn thành</SelectItem>
                                    <SelectItem value="overdue">Quá hạn</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      
                      {report.status === 'pending' && (
                        <Button size="sm" onClick={() => onCreateAction(report.id)}>
                          <Plus className="h-4 w-4 mr-1" />
                          Tạo hành động
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}