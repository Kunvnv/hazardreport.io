import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { 
  HardHat, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  FileText,
  Target,
  Users,
  Shield
} from 'lucide-react';
import { Dashboard } from '@/components/Dashboard';
import { HazardReportForm } from '@/components/HazardReportForm';
import { ReportsList } from '@/components/ReportsList';
import { ActionPlan } from '@/components/ActionPlan';
import { storage } from '@/lib/storage';

export default function Index() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [reports, setReports] = useState(storage.getReports());
  const [actions, setActions] = useState(storage.getActions());
  const [stats, setStats] = useState(storage.getStats());

  // Initialize storage on first load
  useEffect(() => {
    storage.initializeStorage();
    refreshData();
  }, []);

  const refreshData = () => {
    setReports(storage.getReports());
    setActions(storage.getActions());
    setStats(storage.getStats());
  };

  const handleReportSubmitted = () => {
    refreshData();
    toast({
      title: "Thành công",
      description: "Báo cáo đã được gửi thành công!"
    });
  };

  const handleCreateAction = (reportId: number) => {
    setActiveTab('actions');
    // The ActionPlan component will handle the creation
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-700 rounded-full">
                <HardHat className="h-8 w-8" />
              </div>
              <div className="text-center">
                <h1 className="text-3xl font-bold">HỆ THỐNG BÁO CÁO MỐI NGUY & QUẢN LÝ HÀNH ĐỘNG</h1>
                <p className="text-blue-200 mt-1">Zinc Oxide Corporation Vietnam - A Member of KZ Group</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Bar */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng báo cáo</p>
                <p className="text-xl font-bold text-gray-900">{stats.totalReports}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang xử lý</p>
                <p className="text-xl font-bold text-gray-900">{stats.inProgressReports}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-xl font-bold text-gray-900">{stats.completedReports}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Quá hạn</p>
                <p className="text-xl font-bold text-gray-900">{stats.overdueReports}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white shadow-sm border">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="create-report" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Báo Cáo Mối Nguy
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Quản Lý Báo Cáo
            </TabsTrigger>
            <TabsTrigger value="actions" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Hành Động Khắc Phục
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard stats={stats} />
          </TabsContent>

          <TabsContent value="create-report" className="space-y-6">
            <HazardReportForm onReportSubmitted={handleReportSubmitted} />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <ReportsList 
              reports={reports} 
              onCreateAction={handleCreateAction}
              onRefresh={refreshData}
            />
          </TabsContent>

          <TabsContent value="actions" className="space-y-6">
            <ActionPlan 
              actions={actions}
              reports={reports}
              onRefresh={refreshData}
            />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="h-6 w-6 text-blue-400" />
              <h3 className="text-xl font-bold">Hệ thống báo cáo mối nguy hiểm</h3>
            </div>
            <p className="text-gray-400 mb-2">
              Hệ thống báo cáo mối nguy hiểm và quản lý hành động khắc phục © 2025
            </p>
            <p className="text-blue-400 font-semibold">
              Zinc Oxide Corporation Vietnam - A Member of KZ Group
            </p>
            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
              <span>Phiên bản nâng cấp với React & TypeScript</span>
              <span>•</span>
              <span>Powered by MGX Platform</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}