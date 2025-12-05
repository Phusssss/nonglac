import React, { useState } from 'react';

const SvgToReactConverter = () => {
  const [svgInput, setSvgInput] = useState('');
  const [reactOutput, setReactOutput] = useState('');
  const [componentName, setComponentName] = useState('SvgComponent');

  const convertSvgToReact = () => {
    if (!svgInput.trim()) {
      alert('Vui lòng nhập SVG code');
      return;
    }

    try {
      // Clean SVG input
      let cleanSvg = svgInput.trim();
      
      // Convert attributes to React format
      cleanSvg = cleanSvg
        .replace(/class=/g, 'className=')
        .replace(/stroke-width/g, 'strokeWidth')
        .replace(/stroke-linecap/g, 'strokeLinecap')
        .replace(/stroke-linejoin/g, 'strokeLinejoin')
        .replace(/fill-rule/g, 'fillRule')
        .replace(/clip-rule/g, 'clipRule')
        .replace(/stroke-dasharray/g, 'strokeDasharray')
        .replace(/stroke-dashoffset/g, 'strokeDashoffset')
        .replace(/text-anchor/g, 'textAnchor')
        .replace(/font-size/g, 'fontSize')
        .replace(/font-family/g, 'fontFamily')
        .replace(/font-weight/g, 'fontWeight');

      // Generate React component
      const reactComponent = `import React from 'react';

const ${componentName} = (props) => {
  return (
    ${cleanSvg}
  );
};

export default ${componentName};`;

      setReactOutput(reactComponent);
    } catch (error) {
      alert('Lỗi chuyển đổi: ' + error.message);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(reactOutput);
    alert('Đã copy vào clipboard!');
  };

  const clearAll = () => {
    setSvgInput('');
    setReactOutput('');
    setComponentName('SvgComponent');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ color: '#4CAF50', textAlign: 'center', marginBottom: '30px' }}>
        SVG to React Converter
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Input Section */}
        <div>
          <h3>SVG Input</h3>
          <div style={{ marginBottom: '10px' }}>
            <label>Component Name: </label>
            <input
              type="text"
              value={componentName}
              onChange={(e) => setComponentName(e.target.value)}
              style={{
                padding: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                marginLeft: '10px'
              }}
            />
          </div>
          <textarea
            value={svgInput}
            onChange={(e) => setSvgInput(e.target.value)}
            placeholder="Paste your SVG code here..."
            style={{
              width: '100%',
              height: '400px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '14px'
            }}
          />
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={convertSvgToReact}
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginRight: '10px'
              }}
            >
              Convert to React
            </button>
            <button
              onClick={clearAll}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
          </div>
        </div>

        {/* Output Section */}
        <div>
          <h3>React Component Output</h3>
          <textarea
            value={reactOutput}
            readOnly
            style={{
              width: '100%',
              height: '400px',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '14px',
              backgroundColor: '#f9f9f9'
            }}
          />
          <div style={{ marginTop: '10px' }}>
            <button
              onClick={copyToClipboard}
              disabled={!reactOutput}
              style={{
                backgroundColor: reactOutput ? '#2196F3' : '#ccc',
                color: 'white',
                padding: '10px 20px',
                border: 'none',
                borderRadius: '4px',
                cursor: reactOutput ? 'pointer' : 'not-allowed'
              }}
            >
              Copy to Clipboard
            </button>
          </div>
        </div>
      </div>

      {/* Example Section */}
      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h3>Example SVG:</h3>
        <pre style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
{`<svg width="100" height="100" viewBox="0 0 100 100">
  <circle cx="50" cy="50" r="40" fill="#4CAF50" />
  <path d="M30 50 L45 65 L70 35" stroke="white" stroke-width="4" fill="none" />
</svg>`}
        </pre>
      </div>
    </div>
  );
};

export default SvgToReactConverter;