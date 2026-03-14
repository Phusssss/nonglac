import React, { useState, useEffect } from 'react';
import { Card, Table, Empty, Spin, Tag, Avatar, Space, Button, Modal, message } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, CheckCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import referralService from '../../../services/referralService';
import { useAuth } from '../../../hooks/useAuth';
import { missionsService } from '../../../features/missions/services';
import './ReferredUsersList.css';

const ReferredUsersList = ({ referralCode }) => {
  const { user } = useAuth();
  const [referredUsers, setReferredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadReferredUsers();
  }, [referralCode]);

  const loadReferredUsers = async () => {
    if (!referralCode) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const result = await referralService.getReferredUsers(referralCode);
      if (result.success) {
        // Fetch mission data for each referred user
        const usersWithMissions = await Promise.all(
          result.users.map(async (user) => {
            const missionsResult = await missionsService.getUserMissionsData(user.uid);
            
            // Calculate bonus points earned by referrer
            let bonusPointsEarned = 0;
            let level1Completed = false;
            let level2Completed = false;
            
            if (missionsResult.success) {
              const missions = missionsResult.data.missions || [];
              
              // Check Level 1 completion
              const verifyPhoneClaimed = missions.some(m => m.id === 'verify_phone' && m.status === 'claimed');
              const addFarmAddressClaimed = missions.some(m => m.id === 'add_farm_address' && m.status === 'claimed');
              level1Completed = verifyPhoneClaimed && addFarmAddressClaimed;
              
              // Check Level 2 completion
              const addFarmAreaClaimed = missions.some(m => m.id === 'add_farm_area' && m.status === 'claimed');
              const firstProductPostClaimed = missions.some(m => m.id === 'first_product_post' && m.status === 'claimed');
              level2Completed = addFarmAreaClaimed && firstProductPostClaimed;
              
              // Calculate bonus points
              if (level1Completed) bonusPointsEarned += 30;
              if (level2Completed) bonusPointsEarned += 20;
            }
            
            return {
              ...user,
              bonusPointsEarned,
              level1Completed,
              level2Completed,
              missions: missionsResult.success ? missionsResult.data.missions : []
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
      setLoading(false);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setModalVisible(true);
  };

  const getVerificationStatus = (status) => {
    const statusMap = {
      'pending': { color: 'orange', text: 'Chờ xác thực' },
      'verified': { color: 'green', text: 'Đã xác thực' },
      'rejected': { color: 'red', text: 'Bị từ chối' }
    };
    return statusMap[status] || { color: 'default', text: 'Không xác định' };
  };

  const formatDate = (date) => {
    if (!date) return '-';
    if (date.toDate) {
      return date.toDate().toLocaleDateString('vi-VN');
    }
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const columns = [
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
      render: (text) => (
        <Space size="small">
          <PhoneOutlined />
          <span>{text || '-'}</span>
        </Space>
      )
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
      render: (date) => (
        <Space size="small">
          <CalendarOutlined />
          <span>{formatDate(date)}</span>
        </Space>
      )
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'verificationStatus',
      key: 'verificationStatus',
      render: (status) => {
        const statusInfo = getVerificationStatus(status);
        return (
          <Tag color={statusInfo.color} icon={<CheckCircleOutlined />}>
            {statusInfo.text}
          </Tag>
        );
      }
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleViewDetails(record)}
        >
          Xem Chi Tiết
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <Card className="referred-users-list">
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="referred-users-list">
        <div className="list-header">
          <h3 className="list-title">
            👥 Danh Sách Người Dùng Đã Đăng Ký
          </h3>
          <p className="list-subtitle">
            Tổng cộng: <strong>{referredUsers.length}</strong> người dùng
          </p>
        </div>

        {referredUsers.length === 0 ? (
          <Empty
            description="Chưa có ai đăng ký qua link của bạn"
            style={{ marginTop: '40px', marginBottom: '40px' }}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={referredUsers}
            rowKey="uid"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} người dùng`
            }}
            scroll={{ x: 800 }}
          />
        )}
      </Card>

      {/* Modal Chi Tiết */}
      <Modal
        title="Chi Tiết Người Dùng"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        {selectedUser && (
          <div className="user-details">
            <div className="detail-section">
              <Avatar
                size={80}
                icon={<UserOutlined />}
                src={selectedUser.avatar}
                style={{ backgroundColor: '#4CAF50', marginBottom: '16px' }}
              />
              <h3>{selectedUser.displayName || 'Chưa cập nhật'}</h3>
            </div>

            <div className="detail-section">
              <div className="detail-item">
                <span className="detail-label">Số Điện Thoại:</span>
                <span className="detail-value">{selectedUser.phoneNumber || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedUser.email || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Giới Tính:</span>
                <span className="detail-value">
                  {selectedUser.gender === 'male' ? 'Nam' : selectedUser.gender === 'female' ? 'Nữ' : 'Khác'}
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Tuổi:</span>
                <span className="detail-value">{selectedUser.age || '-'}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Ngày Đăng Ký:</span>
                <span className="detail-value">{formatDate(selectedUser.joinDate)}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Trạng Thái:</span>
                <span className="detail-value">
                  <Tag
                    color={getVerificationStatus(selectedUser.verificationStatus).color}
                    icon={<CheckCircleOutlined />}
                  >
                    {getVerificationStatus(selectedUser.verificationStatus).text}
                  </Tag>
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Uy Tín:</span>
                <span className="detail-value">{selectedUser.reputation || 0}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Số Bài Viết:</span>
                <span className="detail-value">{selectedUser.postsCount || 0}</span>
              </div>

              {/* Mission Info */}
              <div className="detail-item" style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' }}>
                <span className="detail-label">
                  <TrophyOutlined style={{ marginRight: '8px', color: '#FFD700' }} />
                  Điểm Nhận Được:
                </span>
                <span className="detail-value" style={{ fontSize: '18px', fontWeight: 'bold', color: '#4CAF50' }}>
                  +{selectedUser.bonusPointsEarned || 0}
                </span>
              </div>

              <div className="detail-item">
                <span className="detail-label">Cấp Độ Hoàn Thành:</span>
                <div className="detail-value">
                  {selectedUser.level1Completed && (
                    <Tag color="green" style={{ marginRight: '8px' }}>
                      <CheckCircleOutlined /> Cấp 1 Hoàn Thành
                    </Tag>
                  )}
                  {selectedUser.level2Completed && (
                    <Tag color="blue">
                      <CheckCircleOutlined /> Cấp 2 Hoàn Thành
                    </Tag>
                  )}
                  {!selectedUser.level1Completed && !selectedUser.level2Completed && (
                    <span className="text-gray-400">Chưa hoàn thành cấp nào</span>
                  )}
                </div>
              </div>

              {/* Mission Details */}
              {selectedUser.missions && selectedUser.missions.length > 0 && (
                <div className="detail-item" style={{ marginTop: '16px' }}>
                  <span className="detail-label">Chi Tiết Nhiệm Vụ:</span>
                  <div className="detail-value" style={{ marginTop: '8px' }}>
                    {selectedUser.missions.map((mission) => (
                      <div key={mission.id} style={{ marginBottom: '8px', padding: '8px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '500' }}>{mission.title}</span>
                          <Tag color={mission.status === 'claimed' ? 'green' : mission.status === 'completed' ? 'blue' : 'default'}>
                            {mission.status === 'claimed' ? 'Đã nhận' : mission.status === 'completed' ? 'Hoàn thành' : 'Chưa làm'}
                          </Tag>
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                          Thưởng: {mission.reward} điểm
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ReferredUsersList;
