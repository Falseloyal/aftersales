import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Rate, Popconfirm, Tag, message,
} from 'antd';
import { PlusOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { feedbackService, customerService, serviceRecordService } from '../services/supabaseService';
import type { Feedback, Customer, ServiceRecord } from '../types';
import dayjs from 'dayjs';

const categoryLabels: Record<string, string> = {
  product: '产品问题',
  service: '服务态度',
  logistics: '物流配送',
  other: '其他',
};
const categoryColors: Record<string, string> = {
  product: 'blue',
  service: 'green',
  logistics: 'orange',
  other: 'default',
};

const FeedbackPage: React.FC = () => {
  const [list, setList] = useState<Feedback[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const load = async () => {
    try {
      const fb = await feedbackService.getAll();
      const cu = await customerService.getAll();
      const sr = await serviceRecordService.getAll();
      setList(fb);
      setCustomers(cu);
      setRecords(sr);
    } catch (e) {
      message.error('加载记录失败');
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = list.filter(
    (f) => f.customerName.includes(searchText) || f.content.includes(searchText)
  );

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      try {
        const customer = customers.find((c) => c.id === values.customerId);
        await feedbackService.create({
          ...values,
          customerName: customer?.name || '',
        });
        message.success('反馈已记录');
        setModalOpen(false);
        form.resetFields();
        load();
      } catch (e) {
        message.error('保存失败');
      }
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await feedbackService.delete(id);
      message.success('反馈已删除');
      load();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '客户', dataIndex: 'customerName', key: 'customerName', width: 120 },
    {
      title: '关联工单',
      dataIndex: 'serviceRecordId',
      key: 'serviceRecordId',
      width: 180,
      render: (id: string) => {
        const r = records.find((rec) => rec.id === id);
        return r ? r.title : '-';
      },
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 100,
      render: (c: string) => <Tag color={categoryColors[c]}>{categoryLabels[c]}</Tag>,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 180,
      render: (r: number) => <Rate disabled value={r} />,
    },
    { title: '反馈内容', dataIndex: 'content', key: 'content', ellipsis: true },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_: unknown, record: Feedback) => (
        <Popconfirm title="确定删除该反馈？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input
          placeholder="搜索客户或反馈内容"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { form.resetFields(); setModalOpen(true); }}
        >
          记录反馈
        </Button>
      </div>

      <Table columns={columns} dataSource={filtered} rowKey="id" locale={{ emptyText: '暂无反馈记录' }} />

      <Modal
        title="记录客户反馈"
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText="确定"
        cancelText="取消"
        width={560}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="customerId" label="客户" rules={[{ required: true, message: '请选择客户' }]}>
            <Select placeholder="请选择客户" showSearch optionFilterProp="label"
              options={customers.map((c) => ({ value: c.id, label: `${c.name} (${c.phone})` }))}
            />
          </Form.Item>
          <Form.Item name="serviceRecordId" label="关联服务记录">
            <Select placeholder="请选择关联服务记录（可选）" allowClear showSearch optionFilterProp="label"
              options={records.map((r) => ({ value: r.id, label: r.title }))}
            />
          </Form.Item>
          <Form.Item name="category" label="反馈分类" rules={[{ required: true, message: '请选择分类' }]}>
            <Select options={Object.entries(categoryLabels).map(([v, l]) => ({ value: v, label: l }))} />
          </Form.Item>
          <Form.Item name="rating" label="评分" rules={[{ required: true, message: '请评分' }]}>
            <Rate />
          </Form.Item>
          <Form.Item name="content" label="反馈内容" rules={[{ required: true, message: '请输入反馈内容' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FeedbackPage;
