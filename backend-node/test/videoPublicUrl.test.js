const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { isPublicHttpUrl } = require('../src/services/videoClient');

describe('isPublicHttpUrl (private network rejection)', () => {
  it('accepts public http(s) URLs', () => {
    assert.equal(isPublicHttpUrl('https://cdn.example.com/a.png'), true);
    assert.equal(isPublicHttpUrl('https://platform-outputs.agnes-ai.space/videos/v2.mp4'), true);
    assert.equal(isPublicHttpUrl('http://imageproxy.zhongzhuan.chat/api/proxy/image/x.png'), true);
    assert.equal(isPublicHttpUrl('https://example.com/static/10.15/img.png'), true);
    assert.equal(isPublicHttpUrl('http://100.64.1.2/a.png'), true); // CGNAT 段不在拦截范围也可
  });

  it('rejects localhost and loopback variants', () => {
    assert.equal(isPublicHttpUrl('http://localhost:5679/static/a.png'), false);
    assert.equal(isPublicHttpUrl('http://127.0.0.1:5679/static/a.png'), false);
    assert.equal(isPublicHttpUrl('http://0.0.0.0/a.png'), false);
    assert.equal(isPublicHttpUrl('http://[::1]:3013/a.png'), false);
    assert.equal(isPublicHttpUrl('http://app.localhost/a.png'), false);
  });

  it('rejects private IPv4 ranges (LAN access via Vite origin)', () => {
    assert.equal(isPublicHttpUrl('http://192.168.11.116:3013/static/projects/x/images/ig_1.png'), false);
    assert.equal(isPublicHttpUrl('http://10.1.2.3/a.png'), false);
    assert.equal(isPublicHttpUrl('http://172.16.0.1/a.png'), false);
    assert.equal(isPublicHttpUrl('http://172.31.255.255/a.png'), false);
    assert.equal(isPublicHttpUrl('http://169.254.169.254/a.png'), false);
  });

  it('does not over-block public IPs sharing digits with private prefixes', () => {
    assert.equal(isPublicHttpUrl('http://103.10.5.6/a.png'), true);
    assert.equal(isPublicHttpUrl('http://172.32.0.1/a.png'), true);
    assert.equal(isPublicHttpUrl('http://192.169.0.1/a.png'), true);
  });

  it('rejects non-http(s) and malformed input', () => {
    assert.equal(isPublicHttpUrl('data:image/png;base64,xxxx'), false);
    assert.equal(isPublicHttpUrl('ftp://example.com/a.png'), false);
    assert.equal(isPublicHttpUrl('/static/a.png'), false);
    assert.equal(isPublicHttpUrl(''), false);
    assert.equal(isPublicHttpUrl('http://'), false);
  });
});
