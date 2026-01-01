import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Divider
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const FilterPanel = ({ onFiltersChange, userRole, transactionIntent }) => {
  const [filters, setFilters] = useState({});
  const [selectedRole, setSelectedRole] = useState(userRole || 'farmer');
  const [selectedIntent, setSelectedIntent] = useState(transactionIntent || 'b2b');

  // Định nghĩa các bộ lọc theo ngữ cảnh
  const userRoles = {
    farmer: 'Nông dân/Nhà vườn',
    trader: 'Thương lái/Chủ vựa', 
    importer: 'Nhà nhập khẩu',
    wholesaler: 'Người mua sỉ'
  };

  const transactionIntents = {
    b2b: 'Mua để kinh doanh/Bán buôn',
    gifting: 'Mua làm quà biếu',
    processing: 'Mua nguyên liệu chế biến'
  };

  // Bộ lọc danh mục sản phẩm
  const productCategories = {
    flowers: {
      name: 'Hoa cắt cành',
      filters: {
        flower_variety: {
          name: 'Chủng loại',
          options: {
            rose: 'Hoa Hồng',
            lily: 'Hoa Ly', 
            carnation: 'Cẩm Chướng',
            gerbera: 'Đồng Tiền'
          }
        },
        flower_color: {
          name: 'Màu sắc',
          options: {
            red: 'Đỏ nhung',
            yellow: 'Vàng',
            cream: 'Kem',
            pink: 'Phấn',
            purple: 'Tím khói'
          }
        },
        stem_length: {
          name: 'Độ dài cành',
          options: {
            vip: '70-80cm+ (Cối VIP)',
            medium: '50-60cm (Trung)',
            short: '<40cm (Tăm/Ngắn)'
          }
        },
        bloom_stage: {
          name: 'Độ nở',
          options: {
            bud: 'Nụ',
            opening: 'Chớm nở',
            open: 'Nở vừa'
          }
        }
      }
    },
    fruits: {
      name: 'Trái cây',
      filters: {
        origin: {
          name: 'Nguồn gốc',
          options: {
            domestic: 'Nội địa',
            imported: 'Nhập khẩu'
          }
        },
        fruit_type: {
          name: 'Loại trái cây',
          options: {
            cherry: 'Cherry (Anh Đào)',
            grape: 'Nho',
            apple: 'Táo',
            orange: 'Cam'
          }
        },
        cherry_size: {
          name: 'Size Cherry',
          options: {
            '32+': '32+mm (VIP)',
            '30-32': '30-32mm',
            '28-30': '28-30mm',
            '26-28': '26-28mm'
          }
        },
        seasonality: {
          name: 'Tính mùa vụ',
          options: {
            in_season: 'Đang vào vụ',
            off_season: 'Trái vụ',
            early_season: 'Đầu vụ',
            late_season: 'Cuối vụ'
          }
        }
      }
    },
    meat_seafood: {
      name: 'Thịt & Hải sản',
      filters: {
        meat_type: {
          name: 'Loại thịt',
          options: {
            beef: 'Thịt Bò',
            pork: 'Thịt Heo',
            seafood: 'Hải sản'
          }
        },
        beef_grade: {
          name: 'Xếp hạng Bò',
          options: {
            a5: 'A5 (Nhật Bản)',
            a4: 'A4 (Nhật Bản)',
            mb9: 'MB 9+ (Úc)',
            prime: 'Prime (Mỹ)'
          }
        },
        feeding: {
          name: 'Nuôi dưỡng',
          options: {
            grain_fed: 'Ăn ngũ cốc',
            grass_fed: 'Ăn cỏ'
          }
        }
      }
    },
    vegetables: {
      name: 'Rau củ & Nấm',
      filters: {
        climate_type: {
          name: 'Phân nhóm khí hậu',
          options: {
            temperate: 'Rau Ôn đới (Đà Lạt)',
            tropical: 'Rau Nhiệt đới'
          }
        },
        mushroom_type: {
          name: 'Loại nấm',
          options: {
            hotpot: 'Nấm ăn lẩu',
            medicinal: 'Nấm Dược liệu/Cao cấp'
          }
        }
      }
    }
  };

  // Bộ lọc chất lượng & tiêu chuẩn
  const qualityFilters = {
    certification: {
      name: 'Chứng nhận',
      options: {
        vietgap: 'VietGAP',
        globalgap: 'GlobalGAP',
        organic_usda: 'Hữu cơ USDA',
        organic_eu: 'Hữu cơ EU',
        ocop_3: 'OCOP 3 sao',
        ocop_4: 'OCOP 4 sao',
        ocop_5: 'OCOP 5 sao',
        gi_protected: 'Chỉ dẫn địa lý'
      }
    },
    trust_score: {
      name: 'Điểm tin cậy Nông Lạc',
      options: {
        diamond: 'Kim Cương',
        gold: 'Vàng',
        verified: 'Mới (Verified)'
      }
    },
    traceability: {
      name: 'Minh bạch nguồn gốc',
      options: {
        digital_log: 'Có nhật ký canh tác điện tử',
        qr_code: 'Có mã QR truy xuất'
      }
    }
  };

  // Bộ lọc thương mại & logistics
  const commercialFilters = {
    packaging: {
      name: 'Quy cách đóng gói',
      options: {
        bulk: 'Thùng (Bulk/Carton)',
        tray: 'Khay/Vỉ (Tray)',
        giftbox: 'Hộp quà/Giỏ quà'
      }
    },
    stock_status: {
      name: 'Tình trạng kho',
      options: {
        in_stock: 'Hàng có sẵn',
        pre_order: 'Đặt trước',
        in_transit: 'Đang vận chuyển'
      }
    },
    shipping: {
      name: 'Vận chuyển',
      options: {
        express: 'Hỏa tốc/Trong ngày',
        cold_chain: 'Xe lạnh',
        normal: 'Xe thường'
      }
    }
  };

  const handleFilterChange = (category, value, checked) => {
    const newFilters = { ...filters };
    
    if (!newFilters[category]) {
      newFilters[category] = [];
    }
    
    if (checked) {
      newFilters[category] = [...newFilters[category], value];
    } else {
      newFilters[category] = newFilters[category].filter(item => item !== value);
    }
    
    if (newFilters[category].length === 0) {
      delete newFilters[category];
    }
    
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setFilters({});
    onFiltersChange({});
  };

  const renderFilterSection = (sectionTitle, filterConfig) => (
    <Accordion key={sectionTitle}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Typography variant="subtitle1" fontWeight="bold">
          {sectionTitle}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormGroup>
          {Object.entries(filterConfig).map(([key, config]) => (
            <Box key={key} mb={2}>
              <Typography variant="body2" fontWeight="medium" mb={1}>
                {config.name}
              </Typography>
              {Object.entries(config.options).map(([value, label]) => (
                <FormControlLabel
                  key={value}
                  control={
                    <Checkbox
                      checked={filters[key]?.includes(value) || false}
                      onChange={(e) => handleFilterChange(key, value, e.target.checked)}
                      size="small"
                    />
                  }
                  label={label}
                  sx={{ ml: 1 }}
                />
              ))}
            </Box>
          ))}
        </FormGroup>
      </AccordionDetails>
    </Accordion>
  );

  const getContextualFilters = () => {
    const contextFilters = {};
    
    // Thêm bộ lọc theo vai trò và mục đích
    if (selectedIntent === 'b2b') {
      contextFilters.packaging = commercialFilters.packaging;
    } else if (selectedIntent === 'gifting') {
      contextFilters.packaging = {
        name: 'Quy cách đóng gói',
        options: {
          giftbox: 'Hộp quà/Giỏ quà',
          tray: 'Khay/Vỉ (Tray)'
        }
      };
    }
    
    return contextFilters;
  };

  return (
    <Box sx={{ width: 320, p: 2, height: '100vh', overflow: 'auto' }}>
      <Typography variant="h6" gutterBottom>
        🔍 Bộ lọc thông minh
      </Typography>

      {/* Phần I: Bộ lọc ngữ cảnh & định danh */}
      <Box mb={3}>
        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>Vai trò tham gia</InputLabel>
          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            label="Vai trò tham gia"
          >
            {Object.entries(userRoles).map(([key, label]) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth size="small">
          <InputLabel>Mục đích giao dịch</InputLabel>
          <Select
            value={selectedIntent}
            onChange={(e) => setSelectedIntent(e.target.value)}
            label="Mục đích giao dịch"
          >
            {Object.entries(transactionIntents).map(([key, label]) => (
              <MenuItem key={key} value={key}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Hiển thị các bộ lọc đã chọn */}
      {Object.keys(filters).length > 0 && (
        <Box mb={2}>
          <Typography variant="body2" gutterBottom>
            Bộ lọc đã chọn:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={0.5} mb={1}>
            {Object.entries(filters).map(([category, values]) =>
              values.map(value => (
                <Chip
                  key={`${category}-${value}`}
                  label={value}
                  size="small"
                  onDelete={() => handleFilterChange(category, value, false)}
                />
              ))
            )}
          </Box>
          <Button size="small" onClick={clearAllFilters}>
            Xóa tất cả
          </Button>
        </Box>
      )}

      {/* Phần II: Bộ lọc danh mục sản phẩm */}
      {Object.entries(productCategories).map(([key, category]) =>
        renderFilterSection(category.name, category.filters)
      )}

      {/* Phần III: Bộ lọc chất lượng & tiêu chuẩn */}
      {renderFilterSection('🏆 Chất lượng & Tiêu chuẩn', qualityFilters)}

      {/* Phần IV: Bộ lọc thương mại & logistics */}
      {renderFilterSection('🚚 Thương mại & Logistics', commercialFilters)}

      {/* Bộ lọc theo ngữ cảnh */}
      {Object.keys(getContextualFilters()).length > 0 &&
        renderFilterSection('🎯 Bộ lọc theo ngữ cảnh', getContextualFilters())
      }
    </Box>
  );
};

export default FilterPanel;