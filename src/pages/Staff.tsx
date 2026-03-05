import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Select, Space, Popconfirm, Tag, message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { staffService } from '../services/supabaseService';
import type { Staff } from '../types';
import dayjs from 'dayjs';

const statusLabels: Record<string, string> = { active: '在职', inactive: '离职' };
const statusColors: Record<string, string> = { active: 'green', inactive: 'default' };

const StaffPage: React.FC = () => {
  const [list, setList] = useState<Staff[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Staff | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const load = async () => {
    try {
      const data = await staffService.getAll();
      setList(data);
    } catch (e) {
      message.error('加载失败');
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = list.filter(
    (s) =>
      s.name.includes(searchText) ||
      s.phone.includes(searchText) ||
      s.department.includes(searchText)
  );

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      try {
        if (editing) {
          await staffService.update(editing.id, values);
          message.success('人员信息已更新');
        } else {
          await staffService.create(values);
          message.success('人员已添加！默认初始登录密码为：yc123456!');
        }
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        load();
      } catch (e: any) {
        message.error('保存失败: ' + (e.message || '未知错误'));
        console.error('Staff Action Error:', e);
      }
    });
  };

  const handleEdit = (record: Staff) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await staffService.delete(id);
      message.success('人员已删除');
      load();
    } catch (e) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '姓名', dataIndex: 'name', key: 'name', width: 100 },
    { title: '登录邮箱', dataIndex: 'email', key: 'email', width: 140 },
    { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 120 },
    { title: '部门', dataIndex: 'department', key: 'department', width: 120 },
    { title: '角色', dataIndex: 'role', key: 'role', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (s: string) => <Tag color={statusColors[s]}>{statusLabels[s]}</Tag>,
    },
    {
      title: '添加时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: Staff) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该人员？" onConfirm={() => handleDelete(record.id)}>
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
          placeholder="搜索姓名、电话、部门"
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
          添加人员
        </Button>
      </div>

      <Table columns={columns} dataSource={filtered} rowKey="id" locale={{ emptyText: '暂无售后人员' }} />

      <Modal
        title={editing ? '编辑人员' : '添加人员'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => { setModalOpen(false); setEditing(null); form.resetFields(); }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          {!editing && (
            <div style={{ marginBottom: 16, color: '#1890ff' }}>
              提示：新建售后人员将自动生成登录账号。
              提示：新建售后人员将自动生成后台登录账号，登录名为下方填写的【登录邮箱】。
              <br />初始密码默认统一为：yc123456!
            </div>
          )}
          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="登录邮箱" rules={[{ required: true, message: '请输入登录邮箱（必需）' }, { type: 'email', message: '邮箱格式不正确' }]}>
            <Input placeholder="输入真实邮箱或自定义格式，例如 zhangsan@local.com" />
          </Form.Item>
          <Form.Item name="phone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="department" label="部门" rules={[{ required: true, message: '请输入部门' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请输入角色' }]}>
            <Input placeholder="如：售后工程师、客服专员" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true, message: '请选择状态' }]} initialValue="active">
            <Select options={Object.entries(statusLabels).map(([v, l]) => ({ value: v, label: l }))} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffPage;
