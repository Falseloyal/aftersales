import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Tag, message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { serviceRecordService, customerService, staffService } from '../services/supabaseService';
import type { ServiceRecord, Customer, Staff } from '../types';
import dayjs from 'dayjs';

const typeLabels: Record<string, string> = {
  repair: '维修', return: '退货', exchange: '换货',
  consultation: '咨询', complaint: '投诉', other: '其他',
};
const statusLabels: Record<string, string> = {
  pending: '待处理', processing: '处理中', resolved: '已解决', closed: '已关闭',
};
const statusColors: Record<string, string> = {
  pending: 'orange', processing: 'blue', resolved: 'green', closed: 'default',
};
const priorityLabels: Record<string, string> = {
  low: '低', medium: '中', high: '高', urgent: '紧急',
};
const priorityColors: Record<string, string> = {
  low: 'default', medium: 'blue', high: 'orange', urgent: 'red',
};

const ServiceRecords: React.FC = () => {
  const [list, setList] = useState<ServiceRecord[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceRecord | null>(null);
  const [viewing, setViewing] = useState<ServiceRecord | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const load = async () => {
    try {
      setList(await serviceRecordService.getAll());
      setCustomers(await customerService.getAll());
      setStaffList((await staffService.getAll()).filter((s) => s.status === 'active'));
    } catch (e) {
      message.error('加载记录失败');
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = list.filter(
    (r) =>
      r.title.includes(searchText) ||
      r.customerName.includes(searchText) ||
      r.staffName.includes(searchText)
  );

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      try {
        const customer = customers.find((c) => c.id === values.customerId);
        const staff = staffList.find((s) => s.id === values.staffId);
        const data = {
          ...values,
          customerName: customer?.name || '',
          staffName: staff?.name || '',
        };
        if (editing) {
          await serviceRecordService.update(editing.id, data);
          message.success('服务记录已更新');
        } else {
          await serviceRecordService.create(data);
          message.success('服务记录已创建');
        }
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        load();
      } catch (e) {
        message.error('保存由于网络错误失败');
      }
    });
  };

  const handleEdit = (record: ServiceRecord) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await serviceRecordService.delete(id);
      message.success('服务记录已删除');
      load();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '标题', dataIndex: 'title', key: 'title', ellipsis: true, width: 180 },
    { title: '客户', dataIndex: 'customerName', key: 'customerName', width: 100 },
    { title: '负责人', dataIndex: 'staffName', key: 'staffName', width: 100 },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (t: string) => typeLabels[t] || t,
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      key: 'priority',
      width: 80,
      render: (p: string) => <Tag color={priorityColors[p]}>{priorityLabels[p]}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s]}</Tag>,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: ServiceRecord) => (
        <Space>
          <Button type="link" onClick={() => { setViewing(record); setDetailOpen(true); }}>
            详情
          </Button>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该记录？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input
          placeholder="搜索标题、客户、负责人"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => { setEditing(null); form.resetFields(); setModalOpen(true); }}
        >
          新建服务记录
        </Button>
      </div>

      <Table columns={columns} dataSource={filtered} rowKey="id" locale={{ emptyText: '暂无服务记录' }} />

      <Modal
        title={editing ? '编辑服务记录' : '新建服务记录'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        okText="确定"
        cancelText="取消"
        width={640}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="customerId" label="客户" rules={[{ required: true, message: '请选择客户' }]}>
            <Select placeholder="请选择客户" showSearch optionFilterProp="label"
              options={customers.map((c) => ({ value: c.id, label: `${c.name} (${c.phone})` }))}
            />
          </Form.Item>
          <Form.Item name="staffId" label="负责人" rules={[{ required: true, message: '请选择负责人' }]}>
            <Select placeholder="请选择负责人" showSearch optionFilterProp="label"
              options={staffList.map((s) => ({ value: s.id, label: `${s.name} (${s.department})` }))}
            />
          </Form.Item>
          <Space style={{ width: '100%' }} size="middle">
            <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]} style={{ width: 180 }}>
              <Select options={Object.entries(typeLabels).map(([v, l]) => ({ value: v, label: l }))} />
            </Form.Item>
            <Form.Item name="priority" label="优先级" rules={[{ required: true, message: '请选择优先级' }]} style={{ width: 180 }}>
              <Select options={Object.entries(priorityLabels).map(([v, l]) => ({ value: v, label: l }))} />
            </Form.Item>
            <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]} style={{ width: 180 }}>
              <Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} />
            </Form.Item>
          </Space>
          <Form.Item name="description" label="问题描述" rules={[{ required: true, message: '请输入问题描述' }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="solution" label="解决方案">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="服务记录详情"
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setViewing(null); }}
        footer={null}
        width={600}
      >
        {viewing && (
          <div style={{ lineHeight: 2.2 }}>
            <p><strong>标题：</strong>{viewing.title}</p>
            <p><strong>客户：</strong>{viewing.customerName}</p>
            <p><strong>负责人：</strong>{viewing.staffName}</p>
            <p><strong>类型：</strong>{typeLabels[viewing.type]}</p>
            <p>
              <strong>优先级：</strong>
              <Tag color={priorityColors[viewing.priority]}>{priorityLabels[viewing.priority]}</Tag>
            </p>
            <p>
              <strong>状态：</strong>
              <Tag color={statusColors[viewing.status]}>{statusLabels[viewing.status]}</Tag>
            </p>
            <p><strong>问题描述：</strong>{viewing.description}</p>
            <p><strong>解决方案：</strong>{viewing.solution || '暂无'}</p>
            <p><strong>创建时间：</strong>{dayjs(viewing.createdAt).format('YYYY-MM-DD HH:mm:ss')}</p>
            <p><strong>更新时间：</strong>{dayjs(viewing.updatedAt).format('YYYY-MM-DD HH:mm:ss')}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ServiceRecords;
