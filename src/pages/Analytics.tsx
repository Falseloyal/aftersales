import React, { useEffect, useMemo, useState } from 'react';
import { Card, Col, Row, Statistic, Empty, Typography } from 'antd';
import {
  ArrowUpOutlined,
  ArrowDownOutlined,
  FileTextOutlined,
  SmileOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { Pie, Column, Line, Area } from '@ant-design/charts';
import { serviceRecordService, feedbackService } from '../services/storage';
import type { ServiceRecord, Feedback } from '../types';
import dayjs from 'dayjs';

const { Title } = Typography;

const typeLabels: Record<string, string> = {
  repair: '维修', return: '退货', exchange: '换货',
  consultation: '咨询', complaint: '投诉', other: '其他',
};
const statusLabels: Record<string, string> = {
  pending: '待处理', processing: '处理中', resolved: '已解决', closed: '已关闭',
};
const statusColors: Record<string, string> = {
  待处理: '#faad14', 处理中: '#1890ff', 已解决: '#52c41a', 已关闭: '#d9d9d9',
};
const priorityLabels: Record<string, string> = {
  low: '低', medium: '中', high: '高', urgent: '紧急',
};
const priorityColors: Record<string, string> = {
  低: '#d9d9d9', 中: '#1890ff', 高: '#faad14', 紧急: '#ff4d4f',
};
const categoryLabels: Record<string, string> = {
  product: '产品问题', service: '服务态度', logistics: '物流配送', other: '其他',
};

const CHART_HEIGHT = 300;

const Analytics: React.FC = () => {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);

  useEffect(() => {
    setRecords(serviceRecordService.getAll());
    setFeedbacks(feedbackService.getAll());
  }, []);

  // ========== 概览卡片指标 ==========
  const overview = useMemo(() => {
    const now = dayjs();
    const thisMonth = records.filter((r) => dayjs(r.createdAt).isSame(now, 'month'));
    const lastMonth = records.filter((r) => dayjs(r.createdAt).isSame(now.subtract(1, 'month'), 'month'));
    const monthDiff = thisMonth.length - lastMonth.length;

    const avgRating = feedbacks.length > 0
      ? feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length
      : 0;

    const resolvedOrClosed = records.filter((r) => r.status === 'resolved' || r.status === 'closed');
    const resolutionRate = records.length > 0
      ? (resolvedOrClosed.length / records.length) * 100
      : 0;

    const handleTimes = resolvedOrClosed
      .map((r) => dayjs(r.updatedAt).diff(dayjs(r.createdAt), 'hour', true))
      .filter((h) => h >= 0);
    const avgHandleTime = handleTimes.length > 0
      ? handleTimes.reduce((s, h) => s + h, 0) / handleTimes.length
      : 0;

    return { thisMonthCount: thisMonth.length, monthDiff, avgRating, resolutionRate, avgHandleTime };
  }, [records, feedbacks]);

  // ========== 人员工作量 ==========
  const staffWorkloadData = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      const name = r.staffName || '未指定';
      map[name] = (map[name] || 0) + 1;
    });
    return Object.entries(map)
      .map(([staff, count]) => ({ staff, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [records]);

  // ========== 服务类型分布 ==========
  const typeDistData = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      const label = typeLabels[r.type] || r.type;
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([type, value]) => ({ type, value }));
  }, [records]);

  // ========== 月度趋势 ==========
  const monthlyTrendData = useMemo(() => {
    const now = dayjs();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      months.push(now.subtract(i, 'month').format('YYYY-MM'));
    }
    const map: Record<string, number> = {};
    records.forEach((r) => {
      const m = dayjs(r.createdAt).format('YYYY-MM');
      map[m] = (map[m] || 0) + 1;
    });
    return months.map((month) => ({ month, count: map[month] || 0 }));
  }, [records]);

  // ========== 评分分布 ==========
  const ratingDistData = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    feedbacks.forEach((f) => {
      if (f.rating >= 1 && f.rating <= 5) counts[f.rating - 1]++;
    });
    return counts.map((count, i) => ({ star: `${i + 1}星`, count }));
  }, [feedbacks]);

  // ========== 满意度月度趋势 ==========
  const satisfactionTrendData = useMemo(() => {
    const now = dayjs();
    const months: string[] = [];
    for (let i = 11; i >= 0; i--) {
      months.push(now.subtract(i, 'month').format('YYYY-MM'));
    }
    const map: Record<string, { sum: number; count: number }> = {};
    feedbacks.forEach((f) => {
      const m = dayjs(f.createdAt).format('YYYY-MM');
      if (!map[m]) map[m] = { sum: 0, count: 0 };
      map[m].sum += f.rating;
      map[m].count++;
    });
    return months.map((month) => ({
      month,
      avgRating: map[month] ? +(map[month].sum / map[month].count).toFixed(1) : null,
    })).filter((d) => d.avgRating !== null) as { month: string; avgRating: number }[];
  }, [feedbacks]);

  // ========== 反馈类别分布 ==========
  const feedbackCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    feedbacks.forEach((f) => {
      const label = categoryLabels[f.category] || f.category;
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([category, value]) => ({ category, value }));
  }, [feedbacks]);

  // ========== 服务状态分布 ==========
  const statusDistData = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      const label = statusLabels[r.status] || r.status;
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([status, value]) => ({ status, value }));
  }, [records]);

  // ========== 优先级分布 ==========
  const priorityDistData = useMemo(() => {
    const map: Record<string, number> = {};
    records.forEach((r) => {
      const label = priorityLabels[r.priority] || r.priority;
      map[label] = (map[label] || 0) + 1;
    });
    return Object.entries(map).map(([priority, value]) => ({ priority, value }));
  }, [records]);

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>数据看板</Title>

      {/* ========== 概览卡片 ========== */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="本月工单"
              value={overview.thisMonthCount}
              prefix={<FileTextOutlined />}
              suffix={
                overview.monthDiff !== 0 ? (
                  <span style={{ fontSize: 14, color: overview.monthDiff > 0 ? '#cf1322' : '#3f8600' }}>
                    {overview.monthDiff > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                    {Math.abs(overview.monthDiff)}
                  </span>
                ) : null
              }
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>较上月</div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="平均满意度"
              value={overview.avgRating}
              precision={1}
              prefix={<SmileOutlined />}
              suffix="/ 5"
              valueStyle={{ color: overview.avgRating >= 4 ? '#3f8600' : overview.avgRating >= 3 ? '#faad14' : '#cf1322' }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              共 {feedbacks.length} 条反馈
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="解决率"
              value={overview.resolutionRate}
              precision={1}
              prefix={<CheckCircleOutlined />}
              suffix="%"
              valueStyle={{ color: overview.resolutionRate >= 80 ? '#3f8600' : overview.resolutionRate >= 60 ? '#faad14' : '#cf1322' }}
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              已解决 + 已关闭
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card hoverable>
            <Statistic
              title="平均处理时长"
              value={overview.avgHandleTime}
              precision={1}
              prefix={<ClockCircleOutlined />}
              suffix="小时"
            />
            <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
              已结案工单
            </div>
          </Card>
        </Col>
      </Row>

      {/* ========== 工作量分析 ========== */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="人员工作量">
            {staffWorkloadData.length > 0 ? (
              <Column
                data={staffWorkloadData}
                xField="staff"
                yField="count"
                colorField="staff"
                label={{ position: 'top' }}
                height={CHART_HEIGHT}
                axis={{ x: { labelAutoRotate: true } }}
                legend={false}
              />
            ) : (
              <Empty description="暂无数据" style={{ height: CHART_HEIGHT, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="服务类型分布">
            {typeDistData.length > 0 ? (
              <Pie
                data={typeDistData}
                angleField="value"
                colorField="type"
                label={{ text: 'type', position: 'outside' }}
                height={CHART_HEIGHT}
                legend={{ color: { position: 'bottom' } }}
                innerRadius={0.5}
              />
            ) : (
              <Empty description="暂无数据" style={{ height: CHART_HEIGHT, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
            )}
          </Card>
        </Col>
      </Row>

      {/* ========== 月度趋势 ========== */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="服务记录月度趋势（近12个月）">
            <Area
              data={monthlyTrendData}
              xField="month"
              yField="count"
              smooth={true}
              height={CHART_HEIGHT}
              style={{ fill: 'l(270) 0:#ffffff 1:#1890ff', fillOpacity: 0.6 }}
              line={{ style: { stroke: '#1890ff', lineWidth: 2 } }}
            />
          </Card>
        </Col>
      </Row>

      {/* ========== 满意度分析 ========== */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="评分分布">
            {feedbacks.length > 0 ? (
              <Column
                data={ratingDistData}
                xField="star"
                yField="count"
                colorField="star"
                color={['#ff4d4f', '#fa8c16', '#fadb14', '#73d13d', '#52c41a']}
                label={{ position: 'top' }}
                height={CHART_HEIGHT}
                legend={false}
              />
            ) : (
              <Empty description="暂无反馈数据" style={{ height: CHART_HEIGHT, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="反馈类别分布">
            {feedbackCategoryData.length > 0 ? (
              <Pie
                data={feedbackCategoryData}
                angleField="value"
                colorField="category"
                label={{ text: 'category', position: 'outside' }}
                height={CHART_HEIGHT}
                legend={{ color: { position: 'bottom' } }}
                innerRadius={0.5}
              />
            ) : (
              <Empty description="暂无反馈数据" style={{ height: CHART_HEIGHT, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
            )}
          </Card>
        </Col>
      </Row>

      {/* ========== 满意度趋势 ========== */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="满意度趋势（近12个月月均评分）">
            {satisfactionTrendData.length > 0 ? (
              <Line
                data={satisfactionTrendData}
                xField="month"
                yField="avgRating"
                smooth={true}
                height={CHART_HEIGHT}
                point={{ shapeField: 'circle', sizeField: 3 }}
                scale={{ y: { domainMin: 0, domainMax: 5 } }}
                style={{ stroke: '#faad14', lineWidth: 2 }}
              />
            ) : (
              <Empty description="暂无反馈数据" style={{ height: CHART_HEIGHT, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
            )}
          </Card>
        </Col>
      </Row>

      {/* ========== 效率分析 ========== */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={8}>
          <Card title="服务状态分布">
            {statusDistData.length > 0 ? (
              <Pie
                data={statusDistData}
                angleField="value"
                colorField="status"
                color={({ status }: { status: string }) => statusColors[status] || '#d9d9d9'}
                label={{ text: 'status', position: 'outside' }}
                height={CHART_HEIGHT}
                legend={{ color: { position: 'bottom' } }}
                innerRadius={0.5}
              />
            ) : (
              <Empty description="暂无数据" style={{ height: CHART_HEIGHT, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="优先级分布">
            {priorityDistData.length > 0 ? (
              <Pie
                data={priorityDistData}
                angleField="value"
                colorField="priority"
                color={({ priority }: { priority: string }) => priorityColors[priority] || '#d9d9d9'}
                label={{ text: 'priority', position: 'outside' }}
                height={CHART_HEIGHT}
                legend={{ color: { position: 'bottom' } }}
                innerRadius={0.5}
              />
            ) : (
              <Empty description="暂无数据" style={{ height: CHART_HEIGHT, display: 'flex', flexDirection: 'column', justifyContent: 'center' }} />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="效率指标">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24, padding: '16px 0' }}>
              <Statistic
                title="总工单数"
                value={records.length}
                prefix={<FileTextOutlined />}
              />
              <Statistic
                title="解决率"
                value={overview.resolutionRate}
                precision={1}
                suffix="%"
                valueStyle={{ color: overview.resolutionRate >= 80 ? '#3f8600' : '#faad14' }}
                prefix={<CheckCircleOutlined />}
              />
              <Statistic
                title="平均处理时长"
                value={overview.avgHandleTime}
                precision={1}
                suffix="小时"
                prefix={<ClockCircleOutlined />}
              />
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Analytics;
