import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Users, 
  MapPin,
  FileText,
  Download
} from 'lucide-react';
import { storage, SystemStats } from '@/lib/storage';
import { getStatusColor, getUrgencyColor, formatDate, exportToCSV } from '@/lib/utils-extended';

interface DashboardProps {
  stats: SystemStats;
}

export function Dashboard({ stats }: DashboardProps) {
  const handleExportReports = () => {
    const reports = storage.getReports();
    const exportData = reports.map(report => ({
      'ID': report.id,
      'Người báo cáo': report.reporter,
      'Vị trí': report.location,
      'Mức độ': report.urgency,
      'Loại rủi ro': report.type,
      'Mô tả': report.description,
      'Ngày báo cáo': report.date,
      'Trạng thái': report.status
    }));
    
    exportToCSV(exportData, `bao-cao-moi-nguy-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handleExportActions = () => {
    const actions = storage.getActions();
    const exportData = actions.map(action => ({
      'ID': action.id,
      'ID Báo cáo': action.reportId,
      'Tiêu đề': action.title,
      'Mô tả': action.description,
      'Phụ trách': action.assignee,
      'Ngày bắt đầu': action.startDate,
      'Hạn hoàn thành': action.dueDate,
      'Trạng thái': action.status,
      'Ưu tiên': action.priority
    }));
    
    exportToCSV(exportData, `hanh-dong-khac-phuc-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const recentReports = storage.getReports().slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng báo cáo</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.pendingReports} chờ xử lý
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressReports}</div>
            <p className="text-xs text-muted-foreground">
              {stats.overdueReports} quá hạn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedReports}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalReports > 0 ? Math.round((stats.completedReports / stats.totalReports) * 100) : 0}% tỷ lệ hoàn thành
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hành động</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalActions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedActions} hoàn thành
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ xử lý báo cáo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Hoàn thành</span>
                <span>{stats.completedReports}/{stats.totalReports}</span>
              </div>
              <Progress 
                value={stats.totalReports > 0 ? (stats.completedReports / stats.totalReports) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Đang xử lý</span>
                <span>{stats.inProgressReports}/{stats.totalReports}</span>
              </div>
              <Progress 
                value={stats.totalReports > 0 ? (stats.inProgressReports / stats.totalReports) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Quá hạn</span>
                <span>{stats.overdueReports}/{stats.totalReports}</span>
              </div>
              <Progress 
                value={stats.totalReports > 0 ? (stats.overdueReports / stats.totalReports) * 100 : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hành động khắc phục</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Hoàn thành</span>
                <span>{stats.completedActions}/{stats.totalActions}</span>
              </div>
              <Progress 
                value={stats.totalActions > 0 ? (stats.completedActions / stats.totalActions) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Đang thực hiện</span>
                <span>{stats.inProgressActions}/{stats.totalActions}</span>
              </div>
              <Progress 
                value={stats.totalActions > 0 ? (stats.inProgressActions / stats.totalActions) * 100 : 0} 
                className="h-2"
              />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Quá hạn</span>
                <span>{stats.overdueActions}/{stats.totalActions}</span>
              </div>
              <Progress 
                value={stats.totalActions > 0 ? (stats.overdueActions / stats.totalActions) * 100 : 0} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Báo cáo gần đây</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportReports}>
              <Download className="h-4 w-4 mr-2" />
              Xuất báo cáo
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportActions}>
              <Download className="h-4 w-4 mr-2" />
              Xuất hành động
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chưa có báo cáo nào</p>
              </div>
            ) : (
              recentReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <AlertTriangle className={`h-5 w-5 ${
                        report.urgency === 'high' ? 'text-red-500' :
                        report.urgency === 'medium' ? 'text-yellow-500' : 'text-green-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {report.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        <p className="text-sm text-gray-500">{report.location}</p>
                        <Users className="h-3 w-3 text-gray-400" />
                        <p className="text-sm text-gray-500">{report.reporter}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getUrgencyColor(report.urgency)}>
                      {report.urgency === 'high' ? 'Cao' : 
                       report.urgency === 'medium' ? 'Trung bình' : 'Thấp'}
                    </Badge>
                    <Badge className={getStatusColor(report.status)}>
                      {report.status === 'completed' ? 'Hoàn thành' :
                       report.status === 'in-progress' ? 'Đang xử lý' :
                       report.status === 'overdue' ? 'Quá hạn' : 'Chờ xử lý'}
                    </Badge>
                    <span className="text-sm text-gray-500">{report.date}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}