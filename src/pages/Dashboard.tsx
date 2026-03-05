import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import {
  UserOutlined,
  ToolOutlined,
  MessageOutlined,
  TeamOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { customerService, staffService, serviceRecordService, feedbackService } from '../services/supabaseService';
import type { ServiceRecord } from '../types';
import dayjs from 'dayjs';

const statusColors: Record<string, string> = {
  pending: 'orange',
  processing: 'blue',
  resolved: 'green',
  closed: 'default',
};
const statusLabels: Record<string, string> = {
  pending: '待处理',
  processing: '处理中',
  resolved: '已解决',
  closed: '已关闭',
};
const priorityColors: Record<string, string> = {
  low: 'default',
  medium: 'blue',
  high: 'orange',
  urgent: 'red',
};
const priorityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '紧急',
};

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    customers: 0,
    staff: 0,
    records: 0,
    feedback: 0,
    pending: 0,
    processing: 0,
    urgent: 0,
  });
  const [recentRecords, setRecentRecords] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const customers = await customerService.getAll();
        const staff = await staffService.getAll();
        const records = await serviceRecordService.getAll();
        const feedback = await feedbackService.getAll();
        setStats({
          customers: customers.length,
          staff: staff.length,
          records: records.length,
          feedback: feedback.length,
          pending: records.filter((r) => r.status === 'pending').length,
          processing: records.filter((r) => r.status === 'processing').length,
          urgent: records.filter((r) => r.priority === 'urgent' && r.status !== 'closed').length,
        });
        setRecentRecords(records.slice(0, 5));
      } catch (e) {
        console.error('获取Dashboard数据失败', e);
      }
    };
    fetchData();
  }, []);

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: '客户', dataIndex: 'customerName', key: 'customerName' },
    { title: '负责人', dataIndex: 'staffName', key: 'staffName' },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      render: (p: string) => <Tag color={priorityColors[p]}>{priorityLabels[p]}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s]}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="客户总数" value={stats.customers} prefix={<UserOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="服务记录" value={stats.records} prefix={<ToolOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="客户反馈" value={stats.feedback} prefix={<MessageOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic title="售后人员" value={stats.staff} prefix={<TeamOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="待处理"
              value={stats.pending}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="处理中"
              value={stats.processing}
              valueStyle={{ color: '#1890ff' }}
              prefix={<SyncOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="已解决"
              value={stats.records - stats.pending - stats.processing}
              valueStyle={{ color: '#52c41a' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="紧急工单"
              value={stats.urgent}
              valueStyle={{ color: '#ff4d4f' }}
              prefix={<ExclamationCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="最近服务记录" style={{ marginTop: 16 }}>
        <Table
          columns={columns}
          dataSource={recentRecords}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: '暂无服务记录' }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
