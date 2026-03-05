import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (values: any) => {
        setLoading(true);
        try {
            let loginEmail = values.name; // Default to the assumption that they typed an email (Admin scenario)

            // If the input doesn't look like an email, assume it's a staff name
            if (!loginEmail.includes('@')) {
                const { data: staffData, error: staffError } = await supabase
                    .from('staff')
                    .select('phone')
                    .eq('name', values.name)
                    .single();

                if (staffError || !staffData) {
                    throw new Error('找不到该姓名的账号');
                }

                // Construct the email we used during registration
                loginEmail = `${staffData.phone}@aftersales.com`;
            }

            // Now sign in with Auth
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: values.password,
            });

            if (authError) throw authError;

            message.success('登录成功！');
            navigate('/');
        } catch (error: any) {
            message.error(error.message || '登录失败，请检查账号密码');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#f0f2f5'
        }}>
            <Card style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={3}>售后服务平台 - 登录</Title>
                </div>

                <Form name="login" onFinish={handleLogin} layout="vertical" size="large">
                    <Form.Item name="name" rules={[{ required: true, message: '请输入您的姓名或邮箱!' }]}>
                        <Input prefix={<UserOutlined />} placeholder="姓名 或 邮箱地址" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
