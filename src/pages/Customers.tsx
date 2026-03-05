import React, { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, Space, Popconfirm, message,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { customerService } from '../services/supabaseService';
import type { Customer } from '../types';
import dayjs from 'dayjs';

const Customers: React.FC = () => {
  const [list, setList] = useState<Customer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();

  const load = async () => {
    try {
      const data = await customerService.getAll();
      setList(data);
    } catch (error) {
      message.error('加载失败');
    }
  };
  useEffect(() => { load(); }, []);

  const filtered = list.filter(
    (c) =>
      c.name.includes(searchText) ||
      c.phone.includes(searchText) ||
      c.company.includes(searchText)
  );

  const handleSubmit = () => {
    form.validateFields().then(async (values) => {
      try {
        if (editing) {
          await customerService.update(editing.id, values);
          message.success('客户信息已更新');
        } else {
          await customerService.create(values);
          message.success('客户已添加');
        }
        setModalOpen(false);
        setEditing(null);
        form.resetFields();
        load();
      } catch (error) {
        message.error('保存失败');
      }
    });
  };

  const handleEdit = (record: Customer) => {
    setEditing(record);
    form.setFieldsValue(record);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await customerService.delete(id);
      message.success('客户已删除');
      load();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '客户姓名', dataIndex: 'name', key: 'name', width: 120 },
    { title: '联系电话', dataIndex: 'phone', key: 'phone', width: 140 },
    { title: '邮箱', dataIndex: 'email', key: 'email', width: 180, ellipsis: true },
    { title: '公司', dataIndex: 'company', key: 'company', width: 160, ellipsis: true },
    { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 160,
      render: (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 140,
      render: (_: unknown, record: Customer) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该客户？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Input
          placeholder="搜索客户姓名、电话、公司"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          allowClear
        />
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditing(null);
            form.resetFields();
            setModalOpen(true);
          }}
        >
          添加客户
        </Button>
      </div>

      <Table columns={columns} dataSource={filtered} rowKey="id" locale={{ emptyText: '暂无客户数据' }} />

      <Modal
        title={editing ? '编辑客户' : '添加客户'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => {
          setModalOpen(false);
          setEditing(null);
          form.resetFields();
        }}
        okText="确定"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="客户姓名" rules={[{ required: true, message: '请输入客户姓名' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="phone" label="联系电话" rules={[{ required: true, message: '请输入联系电话' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="邮箱">
            <Input />
          </Form.Item>
          <Form.Item name="company" label="公司">
            <Input />
          </Form.Item>
          <Form.Item name="address" label="地址">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Customers;
