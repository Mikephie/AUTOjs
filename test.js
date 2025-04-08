const { parseScript, convertToSurge, convertToLoon } = require('./script-converter');

describe('脚本解析器测试', () => {
  test('能正确解析基本元数据', () => {
    const testContent = `#!name = 测试脚本
#!desc = 这是一个测试脚本
#!author = Test Author
#!category = Test

[Rule]
DOMAIN,example.com,DIRECT

[Rewrite]
^http://example\\.com/ad - reject

[MITM]
hostname = example.com, test.com`;
    
    const result = parseScript(testContent);
    
    expect(result.metadata.name).toBe('测试脚本');
    expect(result.metadata.desc).toBe('这是一个测试脚本');
    expect(result.metadata.author).toBe('Test Author');
    expect(result.metadata.category).toBe('Test');
    expect(result.rules.length).toBe(1);
    expect(result.rewrites.length).toBe(1);
    expect(result.hostname).toBe('example.com, test.com');
  });
  
  test('能转换为Surge格式', () => {
    const scriptInfo = {
      metadata: {
        name: '测试脚本',
        desc: '这是一个测试脚本',
        author: 'Test Author',
        category: 'Test'
      },
      rules: [
        { content: 'DOMAIN,example.com,DIRECT', comment: '# 测试规则' }
      ],
      rewrites: [
        { content: '^http://example\\.com/ad - reject', comment: '# 广告拦截' }
      ],
      scripts: [
        { content: 'http-response ^http://example\\.com/api script-path=test.js, requires-body=true, timeout=60, tag=test', comment: '# API脚本' }
      ],
      hostname: 'example.com, test.com'
    };
    
    const result = convertToSurge(scriptInfo);
    
    expect(result).toContain('#!name = 测试脚本');
    expect(result).toContain('[Rule]');
    expect(result).toContain('# 测试规则');
    expect(result).toContain('DOMAIN,example.com,DIRECT');
    expect(result).toContain('[Map Local]');
    expect(result).toContain('# 广告拦截');
    expect(result).toContain('[Script]');
    expect(result).toContain('# API脚本');
    expect(result).toContain('[MITM]');
    expect(result).toContain('hostname = %APPEND% example.com, test.com');
  });
  
  test('能转换为Loon格式', () => {
    const scriptInfo = {
      metadata: {
        name: '测试脚本',
        desc: '这是一个测试脚本',
        author: 'Test Author',
        category: 'Test'
      },
      rules: [
        { content: 'DOMAIN,example.com,DIRECT', comment: '# 测试规则' }
      ],
      rewrites: [
        { content: '^http://example\\.com/ad - reject', comment: '# 广告拦截' }
      ],
      scripts: [
        { content: 'http-response ^http://example\\.com/api script-path=test.js, requires-body=true, timeout=60, tag=test', comment: '# API脚本' }
      ],
      hostname: 'example.com, test.com'
    };
    
    const result = convertToLoon(scriptInfo);
    
    expect(result).toContain('#!name = 测试脚本');
    expect(result).toContain('[Rule]');
    expect(result).toContain('# 测试规则');
    expect(result).toContain('DOMAIN,example.com,DIRECT');
    expect(result).toContain('[Rewrite]');
    expect(result).toContain('# 广告拦截');
    expect(result).toContain('[Script]');
    expect(result).toContain('# API脚本');
    expect(result).toContain('[MITM]');
    expect(result).toContain('hostname = example.com, test.com');
  });
});
