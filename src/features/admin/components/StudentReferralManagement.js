import React, { useState, useEffect } from 'react';
import { Card, Table, Empty, Spin, Tag, Avatar, Space, Button, Modal, message, Input, Select, Drawer } from 'antd';
import { UserOutlined, SearchOutlined, EyeOutlined, TrophyOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { missionsService } from '../../missions/services';
import referralService from '../../../services/referralService';

const StudentReferralManagement = () => {
  const [studentAccounts, setStudentAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [referredUsers, setReferredUsers] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [referredLoading, setReferredLoading] = useState(false);

  useEffect(() => {
    loadStudentAccounts();
  }, []);

  const loadStudentAccounts = async () => {
    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('userType', '==', 'student'));
      const querySnapshot = await getDocs(q);

      const students = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const userData = doc.data();
          const bonusPoints = userData.bonusPoints || 0;
          
          // Get referred users count
          const referredResult = await referralService.getReferredUsers(userData.referralCode);
          const referredCount = referredResult.success ? referredResult.users.length : 0;

          return {
            uid: doc.id,
            ...userData,
            bonusPoints,
            referredCount
          };
        })
      );

      setStudentAccounts(students);
    } catch (error) {
      console.error('Error loading student accounts:', error);
      message.error('Không thể tải danh sách tài khoản sinh viên');
    } finally {
      setLoading(false);
    }
  };

  const loadReferredUsers = async (student) => {
    setReferredLoading(true);
    try {
      const result = await referralService.getReferredUsers(student.referralCode);
      if (result.success) {
        // Fetch mission data for each referred user
        const usersWithMissions = await Promise.all(
          result.users.map(async (user) => {
            const missionsResult = await missionsService.getUserMissionsData(user.uid);
            
            let bonusPointsEarned = 0;
            let level1Completed = false;
            let level2Completed = false;
            
            if (missionsResult.success) {
              const missions = missionsResult.data.missions || [];
              
              const verifyPhoneClaimed = missions.some(m => m.id === 'verify_phone' && m.status === 'claimed');
              const addFarmAddressClaimed = missions.some(m => m.id === 'add_farm_address' && m.status === 'claimed');
              level1Completed = verifyPhoneClaimed && addFarmAddressClaimed;
              
              const addFarmAreaClaimed = missions.some(m => m.id === 'add_farm_area' && m.status === 'claimed');
              const firstProductPostClaimed = missions.some(m => m.id === 'first_product_post' && m.status === 'claimed');
              level2Completed = addFarmAreaClaimed && firstProductPostClaimed;
              
              if (level1Completed) bonusPointsEarned += 30;
              if (level2Completed) bonusPointsEarned += 20;
            }
            
            return {
              ...user,
              bonusPointsEarned,
              level1Completed,
              level2Completed
            };
          })
        );
        setReferredUsers(usersWithMissions);
      } else {
        message.error('Không thể tải danh sách người dùng');
      }
    } catch (error) {
      console.error('Error loading referred users:', error);
      message.error('Có lỗi xảy ra');
    } finally {
      setReferredLoading(false);
    }
  };

  const handleViewDetails = (student) => {
    setSelectedStudent(student);
    loadReferredUsers(student);
    setDrawerVisible(true);
  };

  const formatDate = (date) => {
    if (!date) return '-';
    if (date.toDate) {
      return date.toDate().toLocaleDateString('vi-VN');
    }
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const filteredStudents = studentAccounts.filter(student =>
    student.displayName?.toLowerCase().includes(searchText.toLowerCase()) ||
    student.phoneNumber?.includes(searchText) ||
    student.referralCode?.includes(searchText)
  );

  const studentColumns = [
    {
      title: 'Tên Sinh Viên',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text, record) => (
        <Space>
          <Avatar
            size={32}
            icon={<UserOutlined />}
            src={record.avatar}
            style={{ backgroundColor: '#4CAF50' }}
          />
          <span>{text || 'Chưa cập nhật'}</span>
        </Space>
      )
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (text) => text || '-'
    },
    {
      title: 'Mã Giới Thiệu',
      dataIndex: 'referralCode',
      key: 'referralCode',
      render: (code) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {code || '-'}
        </span>
      )
    },
    {
      title: 'Số Người Mời',
      dataIndex: 'referredCount',
      key: 'referredCount',
      render: (count) => (
        <Tag color="blue">{count || 0}</Tag>
      ),
      sorter: (a, b) => (a.referredCount || 0) - (b.referredCount || 0)
    },
    {
      title: 'Điểm Bonus',
      dataIndex: 'bonusPoints',
      key: 'bonusPoints',
      render: (points) => (
        <Space size="small">
          <TrophyOutlined style={{ color: '#FFD700' }} />
          <span className="font-semibold" style={{ color: '#4CAF50' }}>+{points || 0}</span>
        </Space>
      ),
      sorter: (a, b) => (a.bonusPoints || 0) - (b.bonusPoints || 0)
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date)
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetails(record)}
        >
          Xem Chi Tiết
        </Button>
      )
    }
  ];

  const referredColumns = [
    {
      title: 'Tên Người Dùng',
      dataIndex: 'displayName',
      key: 'displayName',
      render: (text, record) => (
        <Space>
          <Avatar
            size={32}
            icon={<UserOutlined />}
            src={record.avatar}
            style={{ backgroundColor: '#4CAF50' }}
          />
          <span>{text || 'Chưa cập nhật'}</span>
        </Space>
      )
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      render: (text) => text || '-'
    },
    {
      title: 'Điểm Nhận Được',
      dataIndex: 'bonusPointsEarned',
      key: 'bonusPointsEarned',
      render: (points) => (
        <Space size="small">
          <TrophyOutlined style={{ color: '#FFD700' }} />
          <span className="font-semibold" style={{ color: '#4CAF50' }}>+{points || 0}</span>
        </Space>
      ),
      sorter: (a, b) => (a.bonusPointsEarned || 0) - (b.bonusPointsEarned || 0)
    },
    {
      title: 'Cấp Độ Hoàn Thành',
      dataIndex: 'level1Completed',
      key: 'levelCompleted',
      render: (level1, record) => {
        const tags = [];
        if (record.level1Completed) {
          tags.push(<Tag key="level1" color="green">Cấp 1 ✓</Tag>);
        }
        if (record.level2Completed) {
          tags.push(<Tag key="level2" color="blue">Cấp 2 ✓</Tag>);
        }
        return tags.length > 0 ? <Space>{tags}</Space> : <span className="text-gray-400">Chưa hoàn thành</span>;
      }
    },
    {
      title: 'Ngày Đăng Ký',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date) => formatDate(date)
    }
  ];

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Quản Lý Tài Khoản Sinh Viên</h2>
          <Input
            placeholder="Tìm kiếm theo tên, số điện thoại hoặc mã giới thiệu..."
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ maxWidth: '400px' }}
          />
        </div>

        {filteredStudents.length === 0 ? (
          <Empty description="Không có tài khoản sinh viên nào" />
        ) : (
          <Table
            columns={studentColumns}
            dataSource={filteredStudents}
            rowKey="uid"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} tài khoản`
            }}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>

      {/* Drawer Chi Tiết */}
      <Drawer
        title={`Chi Tiết: ${selectedStudent?.displayName || 'Sinh Viên'}`}
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={900}
      >
        {selectedStudent && (
          <div className="space-y-6">
            {/* Student Info */}
            <Card title="Thông Tin Sinh Viên" size="small">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Tên</p>
                  <p className="font-semibold">{selectedStudent.displayName || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Số Điện Thoại</p>
                  <p className="font-semibold">{selectedStudent.phoneNumber || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="font-semibold">{selectedStudent.email || '-'}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Mã Giới Thiệu</p>
                  <p className="font-mono text-sm bg-gray-100 px-2 py-1 rounded inline-block">
                    {selectedStudent.referralCode || '-'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Referral Stats */}
            <Card title="Thống Kê Giới Thiệu" size="small">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Số Người Mời</p>
                  <p className="text-2xl font-bold text-blue-600">{selectedStudent.referredCount || 0}</p>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Điểm Bonus</p>
                  <p className="text-2xl font-bold text-green-600">+{selectedStudent.bonusPoints || 0}</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <p className="text-gray-600 text-sm">Ngày Tạo</p>
                  <p className="text-sm font-semibold">{formatDate(selectedStudent.createdAt)}</p>
                </div>
              </div>
            </Card>

            {/* Referred Users Table */}
            <Card title="Danh Sách Người Dùng Đã Mời" size="small">
              {referredLoading ? (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Spin size="large" />
                </div>
              ) : referredUsers.length === 0 ? (
                <Empty description="Chưa có ai đăng ký qua link của sinh viên này" />
              ) : (
                <Table
                  columns={referredColumns}
                  dataSource={referredUsers}
                  rowKey="uid"
                  pagination={{
                    pageSize: 5,
                    showSizeChanger: true,
                    showTotal: (total) => `Tổng ${total} người dùng`
                  }}
                  scroll={{ x: 800 }}
                  size="small"
                />
              )}
            </Card>
          </div>
        )}
      </Drawer>
    </>
  );
};

export default StudentReferralManagement;
