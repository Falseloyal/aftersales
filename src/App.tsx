import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import AppLayout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import ServiceRecords from './pages/ServiceRecords';
import FeedbackPage from './pages/Feedback';
import StaffPage from './pages/Staff';
import Analytics from './pages/Analytics';

const App: React.FC = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/service-records" element={<ServiceRecords />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/staff" element={<StaffPage />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ConfigProvider>
  );
};

export default App;
