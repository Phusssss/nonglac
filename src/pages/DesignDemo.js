import React from 'react';
import { Layout } from 'antd';
import ComponentShowcase from '../components/demo/ComponentShowcase';
import AdvancedSEO from '../components/AdvancedSEO';

const { Content } = Layout;

const DesignDemo = () => {
  return (
    <>
      <AdvancedSEO 
        title="Design System Demo - NôngLạc"
        description="Showcase của hệ thống thiết kế NôngLạc với Ant Design"
        keywords="design system, ant design, nông nghiệp, ui components"
        url="/design-demo"
      />
      
      <Layout style={{ minHeight: '100vh' }}>
        <Content>
          <ComponentShowcase />
        </Content>
      </Layout>
    </>
  );
};

export default DesignDemo;