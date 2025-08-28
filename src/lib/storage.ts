export interface HazardReport {
  id: number;
  reporter: string;
  location: string;
  urgency: 'low' | 'medium' | 'high';
  type: string;
  description: string;
  image?: string;
  imageType?: 'camera' | 'upload';
  date: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  createdAt: Date;
  updatedAt: Date;
}

export interface ActionPlan {
  id: number;
  reportId: number;
  title: string;
  description: string;
  assignee: string;
  startDate: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'overdue';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

export interface SystemStats {
  totalReports: number;
  pendingReports: number;
  inProgressReports: number;
  completedReports: number;
  overdueReports: number;
  totalActions: number;
  pendingActions: number;
  inProgressActions: number;
  completedActions: number;
  overdueActions: number;
}

class StorageManager {
  private readonly REPORTS_KEY = 'hazardReports';
  private readonly ACTIONS_KEY = 'actionPlans';
  private readonly SETTINGS_KEY = 'systemSettings';

  // Sample data for demonstration
  private sampleReports: HazardReport[] = [
    {
      id: 1,
      reporter: 'Nguyen Van A',
      location: 'Tầng 2, CBQ',
      urgency: 'medium',
      type: 'Điện',
      description: 'Dây điện hở, không được bảo vệ',
      date: '27/8/2025',
      status: 'completed',
      createdAt: new Date('2025-08-27'),
      updatedAt: new Date('2025-08-27')
    },
    {
      id: 2,
      reporter: 'Le Thi B',
      location: 'Kho thành phẩm, lối đi lại',
      urgency: 'high',
      type: 'Môi trường',
      description: 'Sàn nhà trơn trượt do dầu máy rò rỉ',
      date: '26/8/2025',
      status: 'in-progress',
      createdAt: new Date('2025-08-26'),
      updatedAt: new Date('2025-08-26')
    },
    {
      id: 3,
      reporter: 'Pham Van E',
      location: 'Phòng nghỉ, tầng 1',
      urgency: 'low',
      type: 'Khác',
      description: 'Tủ lạnh hư hỏng, thực phẩm có nguy cơ hư hỏng',
      date: '25/8/2025',
      status: 'overdue',
      createdAt: new Date('2025-08-25'),
      updatedAt: new Date('2025-08-25')
    },
    {
      id: 4,
      reporter: 'Nguyen Van A',
      location: 'IZO',
      urgency: 'medium',
      type: 'Cháy nổ',
      description: 'Thiết bị chữa cháy hết hạn, cần thay thế ngay',
      date: '27/8/2025',
      status: 'pending',
      createdAt: new Date('2025-08-27'),
      updatedAt: new Date('2025-08-27')
    }
  ];

  private sampleActions: ActionPlan[] = [
    {
      id: 1,
      reportId: 1,
      title: 'Sửa chữa hệ thống điện',
      description: 'Tạm ngắt điện, thực hiện đấu nối và bọc lại dây điện',
      assignee: 'Nguyen Van C',
      startDate: '25/8/2025',
      dueDate: '27/8/2025',
      status: 'completed',
      priority: 'medium',
      createdAt: new Date('2025-08-25'),
      updatedAt: new Date('2025-08-27')
    },
    {
      id: 2,
      reportId: 2,
      title: 'Vệ sinh và sửa chữa máy',
      description: 'Vệ sinh sàn, sửa chữa máy rò rỉ, cảnh báo nguy hiểm',
      assignee: 'Tran Van D',
      startDate: '26/8/2025',
      dueDate: '30/8/2025',
      status: 'in-progress',
      priority: 'high',
      createdAt: new Date('2025-08-26'),
      updatedAt: new Date('2025-08-28')
    },
    {
      id: 3,
      reportId: 3,
      title: 'Thay thế tủ lạnh',
      description: 'Thay thế tủ lạnh mới, kiểm tra thực phẩm',
      assignee: 'Nguyen Thi F',
      startDate: '18/8/2025',
      dueDate: '20/8/2025',
      status: 'overdue',
      priority: 'low',
      createdAt: new Date('2025-08-18'),
      updatedAt: new Date('2025-08-20')
    }
  ];

  // Initialize storage with sample data if empty
  initializeStorage(): void {
    if (!localStorage.getItem(this.REPORTS_KEY)) {
      localStorage.setItem(this.REPORTS_KEY, JSON.stringify(this.sampleReports));
    }
    if (!localStorage.getItem(this.ACTIONS_KEY)) {
      localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(this.sampleActions));
    }
  }

  // Reports management
  getReports(): HazardReport[] {
    const reports = localStorage.getItem(this.REPORTS_KEY);
    return reports ? JSON.parse(reports) : [];
  }

  addReport(report: Omit<HazardReport, 'id' | 'createdAt' | 'updatedAt'>): HazardReport {
    const reports = this.getReports();
    const newReport: HazardReport = {
      ...report,
      id: reports.length > 0 ? Math.max(...reports.map(r => r.id)) + 1 : 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    reports.push(newReport);
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
    return newReport;
  }

  updateReport(id: number, updates: Partial<HazardReport>): HazardReport | null {
    const reports = this.getReports();
    const index = reports.findIndex(r => r.id === id);
    
    if (index === -1) return null;
    
    reports[index] = {
      ...reports[index],
      ...updates,
      updatedAt: new Date()
    };
    
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(reports));
    return reports[index];
  }

  deleteReport(id: number): boolean {
    const reports = this.getReports();
    const filteredReports = reports.filter(r => r.id !== id);
    
    if (filteredReports.length === reports.length) return false;
    
    localStorage.setItem(this.REPORTS_KEY, JSON.stringify(filteredReports));
    
    // Also delete related actions
    const actions = this.getActions();
    const filteredActions = actions.filter(a => a.reportId !== id);
    localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(filteredActions));
    
    return true;
  }

  // Actions management
  getActions(): ActionPlan[] {
    const actions = localStorage.getItem(this.ACTIONS_KEY);
    return actions ? JSON.parse(actions) : [];
  }

  addAction(action: Omit<ActionPlan, 'id' | 'createdAt' | 'updatedAt'>): ActionPlan {
    const actions = this.getActions();
    const newAction: ActionPlan = {
      ...action,
      id: actions.length > 0 ? Math.max(...actions.map(a => a.id)) + 1 : 1,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    actions.push(newAction);
    localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(actions));
    return newAction;
  }

  updateAction(id: number, updates: Partial<ActionPlan>): ActionPlan | null {
    const actions = this.getActions();
    const index = actions.findIndex(a => a.id === id);
    
    if (index === -1) return null;
    
    actions[index] = {
      ...actions[index],
      ...updates,
      updatedAt: new Date()
    };
    
    localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(actions));
    return actions[index];
  }

  deleteAction(id: number): boolean {
    const actions = this.getActions();
    const filteredActions = actions.filter(a => a.id !== id);
    
    if (filteredActions.length === actions.length) return false;
    
    localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(filteredActions));
    return true;
  }

  // Statistics
  getStats(): SystemStats {
    const reports = this.getReports();
    const actions = this.getActions();

    return {
      totalReports: reports.length,
      pendingReports: reports.filter(r => r.status === 'pending').length,
      inProgressReports: reports.filter(r => r.status === 'in-progress').length,
      completedReports: reports.filter(r => r.status === 'completed').length,
      overdueReports: reports.filter(r => r.status === 'overdue').length,
      totalActions: actions.length,
      pendingActions: actions.filter(a => a.status === 'pending').length,
      inProgressActions: actions.filter(a => a.status === 'in-progress').length,
      completedActions: actions.filter(a => a.status === 'completed').length,
      overdueActions: actions.filter(a => a.status === 'overdue').length
    };
  }

  // Export data
  exportToJSON(): string {
    return JSON.stringify({
      reports: this.getReports(),
      actions: this.getActions(),
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  // Import data
  importFromJSON(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (data.reports && Array.isArray(data.reports)) {
        localStorage.setItem(this.REPORTS_KEY, JSON.stringify(data.reports));
      }
      if (data.actions && Array.isArray(data.actions)) {
        localStorage.setItem(this.ACTIONS_KEY, JSON.stringify(data.actions));
      }
      return true;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }

  // Clear all data
  clearAllData(): void {
    localStorage.removeItem(this.REPORTS_KEY);
    localStorage.removeItem(this.ACTIONS_KEY);
    localStorage.removeItem(this.SETTINGS_KEY);
  }
}

export const storage = new StorageManager();