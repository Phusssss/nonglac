import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent
} from '@mui/material';
import GitHubImageUpload from '../GitHubImageUpload';

const ProductPostForm = ({ onSubmit, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    // Bước 1: Ngữ cảnh & Định danh
    userRole: '',
    transactionIntent: '',
    
    // Bước 2: Thông tin cơ bản
    name: '',
    category: '',
    description: '',
    
    // Bước 3: Thuộc tính sản phẩm (động theo danh mục)
    productAttributes: {},
    
    // Bước 4: Chất lượng & Tiêu chuẩn
    certification: [],
    trustScore: 'verified',
    traceability: [],
    
    // Bước 5: Thương mại & Logistics
    price: '',
    unit: '',
    packaging: '',
    stockStatus: '',
    shipping: '',
    
    // Bước 6: Hình ảnh & Thông tin liên hệ
    imageUrls: [],
    contactInfo: {
      supplier: '',
      phone: '',
      address: ''
    }
  });

  const steps = [
    'Ngữ cảnh & Định danh',
    'Thông tin cơ bản', 
    'Thuộc tính sản phẩm',
    'Chất lượng & Tiêu chuẩn',
    'Thương mại & Logistics',
    'Hình ảnh & Liên hệ'
  ];

  const userRoles = {
    farmer: 'Nông dân/Nhà vườn',
    trader: 'Thương lái/Chủ vựa',
    importer: 'Nhà nhập khẩu',
    wholesaler: 'Người mua sỉ'
  };

  const transactionIntents = {
    b2b: 'Bán buôn/Kinh doanh',
    retail: 'Bán lẻ',
    export: 'Xuất khẩu'
  };

  const productCategories = {
    flowers: 'Hoa cắt cành',
    fruits: 'Trái cây',
    meat_seafood: 'Thịt & Hải sản',
    vegetables: 'Rau củ & Nấm'
  };

  // Thuộc tính động theo danh mục
  const getCategoryAttributes = (category) => {
    switch (category) {
      case 'flowers':
        return {
          flower_variety: {
            label: 'Chủng loại',
            options: { rose: 'Hoa Hồng', lily: 'Hoa Ly', carnation: 'Cẩm Chướng', gerbera: 'Đồng Tiền' }
          },
          flower_color: {
            label: 'Màu sắc',
            options: { red: 'Đỏ nhung', yellow: 'Vàng', cream: 'Kem', pink: 'Phấn', purple: 'Tím khói' }
          },
          stem_length: {
            label: 'Độ dài cành',
            options: { vip: '70-80cm+ (Cối VIP)', medium: '50-60cm (Trung)', short: '<40cm (Tăm/Ngắn)' }
          },
          bloom_stage: {
            label: 'Độ nở',
            options: { bud: 'Nụ', opening: 'Chớm nở', open: 'Nở vừa' }
          }
        };
      case 'fruits':
        return {
          origin: {
            label: 'Nguồn gốc',
            options: { domestic: 'Nội địa', imported: 'Nhập khẩu' }
          },
          fruit_type: {
            label: 'Loại trái cây',
            options: { cherry: 'Cherry', grape: 'Nho', apple: 'Táo', orange: 'Cam' }
          },
          seasonality: {
            label: 'Tính mùa vụ',
            options: { in_season: 'Đang vào vụ', off_season: 'Trái vụ' }
          }
        };
      default:
        return {};
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAttributeChange = (attribute, value) => {
    setFormData(prev => ({
      ...prev,
      productAttributes: {
        ...prev.productAttributes,
        [attribute]: value
      }
    }));
  };

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.category || !formData.price) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    
    console.log('Submitting product with images:', formData.imageUrls);
    onSubmit(formData);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0: // Ngữ cảnh & Định danh
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Vai trò của bạn</InputLabel>
                <Select
                  value={formData.userRole}
                  onChange={(e) => handleInputChange('userRole', e.target.value)}
                  label="Vai trò của bạn"
                >
                  {Object.entries(userRoles).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Mục đích giao dịch</InputLabel>
                <Select
                  value={formData.transactionIntent}
                  onChange={(e) => handleInputChange('transactionIntent', e.target.value)}
                  label="Mục đích giao dịch"
                >
                  {Object.entries(transactionIntents).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1: // Thông tin cơ bản
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên sản phẩm"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="VD: Hoa Hồng Đỏ Nhung Cao Cấp"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Danh mục sản phẩm</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  label="Danh mục sản phẩm"
                >
                  {Object.entries(productCategories).map(([key, label]) => (
                    <MenuItem key={key} value={key}>{label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Mô tả sản phẩm"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Mô tả chi tiết về sản phẩm, chất lượng, đặc điểm..."
              />
            </Grid>
          </Grid>
        );

      case 2: // Thuộc tính sản phẩm
        const attributes = getCategoryAttributes(formData.category);
        return (
          <Grid container spacing={2}>
            {Object.entries(attributes).map(([key, config]) => (
              <Grid item xs={12} sm={6} key={key}>
                <FormControl fullWidth>
                  <InputLabel>{config.label}</InputLabel>
                  <Select
                    value={formData.productAttributes[key] || ''}
                    onChange={(e) => handleAttributeChange(key, e.target.value)}
                    label={config.label}
                  >
                    {Object.entries(config.options).map(([value, label]) => (
                      <MenuItem key={value} value={value}>{label}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            ))}
          </Grid>
        );

      case 3: // Chất lượng & Tiêu chuẩn
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Chứng nhận (có thể chọn nhiều):
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {['VietGAP', 'GlobalGAP', 'Hữu cơ USDA', 'OCOP 3 sao', 'OCOP 4 sao', 'OCOP 5 sao'].map(cert => (
                  <Chip
                    key={cert}
                    label={cert}
                    clickable
                    color={formData.certification.includes(cert) ? 'primary' : 'default'}
                    onClick={() => {
                      const newCerts = formData.certification.includes(cert)
                        ? formData.certification.filter(c => c !== cert)
                        : [...formData.certification, cert];
                      handleInputChange('certification', newCerts);
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Minh bạch nguồn gốc:
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {['Nhật ký canh tác điện tử', 'Mã QR truy xuất'].map(trace => (
                  <Chip
                    key={trace}
                    label={trace}
                    clickable
                    color={formData.traceability.includes(trace) ? 'primary' : 'default'}
                    onClick={() => {
                      const newTrace = formData.traceability.includes(trace)
                        ? formData.traceability.filter(t => t !== trace)
                        : [...formData.traceability, trace];
                      handleInputChange('traceability', newTrace);
                    }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        );

      case 4: // Thương mại & Logistics
        return (
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Giá bán"
                type="number"
                value={formData.price}
                onChange={(e) => handleInputChange('price', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Đơn vị"
                value={formData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
                placeholder="VD: cành, kg, thùng"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Quy cách đóng gói</InputLabel>
                <Select
                  value={formData.packaging}
                  onChange={(e) => handleInputChange('packaging', e.target.value)}
                  label="Quy cách đóng gói"
                >
                  <MenuItem value="bulk">Thùng (Bulk/Carton)</MenuItem>
                  <MenuItem value="tray">Khay/Vỉ (Tray)</MenuItem>
                  <MenuItem value="giftbox">Hộp quà/Giỏ quà</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Tình trạng kho</InputLabel>
                <Select
                  value={formData.stockStatus}
                  onChange={(e) => handleInputChange('stockStatus', e.target.value)}
                  label="Tình trạng kho"
                >
                  <MenuItem value="in_stock">Hàng có sẵn</MenuItem>
                  <MenuItem value="pre_order">Đặt trước</MenuItem>
                  <MenuItem value="in_transit">Đang vận chuyển</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 5: // Thông tin liên hệ & Hình ảnh
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                📷 Hình ảnh sản phẩm
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Chọn nhiều ảnh cùng lúc để hiển thị đầy đủ sản phẩm
              </Typography>
              <GitHubImageUpload
                onUploadComplete={(imageUrl) => {
                  // Callback cho từng ảnh (giữ nguyên để tương thích)
                  console.log('Uploaded single image:', imageUrl);
                }}
                onBatchUploadComplete={(imageUrls) => {
                  // Callback cho toàn bộ batch - đây là cách tốt hơn
                  setFormData(prev => ({
                    ...prev,
                    imageUrls: [...(prev.imageUrls || []), ...imageUrls]
                  }));
                }}
                maxSize={5}
              />
              
              {formData.imageUrls && formData.imageUrls.length > 0 && (
                <Box mt={2}>
                  <Typography variant="body2" gutterBottom color="success.main">
                    ✓ Đã upload {formData.imageUrls.length} ảnh thành công
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {formData.imageUrls.map((url, index) => (
                      <Box key={index} position="relative">
                        <img
                          src={url}
                          alt={`Uploaded ${index + 1}`}
                          style={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: 4,
                            border: '2px solid #4caf50'
                          }}
                        />
                        <Chip
                          label="×"
                          size="small"
                          color="error"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              imageUrls: prev.imageUrls.filter((_, i) => i !== index)
                            }));
                          }}
                          sx={{
                            position: 'absolute',
                            top: -8,
                            right: -8,
                            minWidth: 20,
                            height: 20
                          }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                📞 Thông tin liên hệ
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên nhà cung cấp/Vườn"
                value={formData.contactInfo.supplier}
                onChange={(e) => handleInputChange('contactInfo', {
                  ...formData.contactInfo,
                  supplier: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Số điện thoại"
                value={formData.contactInfo.phone}
                onChange={(e) => handleInputChange('contactInfo', {
                  ...formData.contactInfo,
                  phone: e.target.value
                })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ"
                value={formData.contactInfo.address}
                onChange={(e) => handleInputChange('contactInfo', {
                  ...formData.contactInfo,
                  address: e.target.value
                })}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          🌾 Đăng sản phẩm mới
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Hệ thống sẽ tự động tối ưu hiển thị sản phẩm dựa trên thông tin bạn cung cấp
        </Alert>

        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
              <StepContent>
                <Box sx={{ mt: 2, mb: 2 }}>
                  {renderStepContent(index)}
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Button
                    variant="contained"
                    onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    {index === steps.length - 1 ? 'Đăng sản phẩm' : 'Tiếp tục'}
                  </Button>
                  <Button
                    disabled={index === 0}
                    onClick={handleBack}
                    sx={{ mt: 1, mr: 1 }}
                  >
                    Quay lại
                  </Button>
                  {index === 0 && (
                    <Button onClick={onCancel} sx={{ mt: 1 }}>
                      Hủy
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </CardContent>
    </Card>
  );
};

export default ProductPostForm;