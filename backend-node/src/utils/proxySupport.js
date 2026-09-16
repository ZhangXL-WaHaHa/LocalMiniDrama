/**
 * 出站代理支持：部分 AI 中转站域名被 DNS 污染或直连受限（如 api.vectorengine.ai），
 * 需经本机代理访问。在进程启动最早阶段调用，使全局 fetch 与原生 http(s) 请求统一走代理。
 *
 * 代理地址优先级：环境变量 HTTPS_PROXY/HTTP_PROXY/ALL_PROXY > config.yaml network.proxy_url
 */
const http = require('http');
const https = require('https');

function resolveProxyUrl(cfg) {
  const fromEnv = process.env.HTTPS_PROXY
    || process.env.https_proxy
    || process.env.HTTP_PROXY
    || process.env.http_proxy
    || process.env.ALL_PROXY
    || process.env.all_proxy;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();
  const fromCfg = cfg && cfg.network && cfg.network.proxy_url;
  if (fromCfg && String(fromCfg).trim()) return String(fromCfg).trim();
  return '';
}

function setupOutboundProxy(cfg) {
  const proxyUrl = resolveProxyUrl(cfg);
  if (!proxyUrl) return '';

  try {
    const { ProxyAgent, setGlobalDispatcher } = require('undici');
    setGlobalDispatcher(new ProxyAgent(proxyUrl));
  } catch (e) {
    console.warn('[proxy] fetch 全局代理初始化失败:', e.message);
  }

  try {
    const { HttpsProxyAgent } = require('https-proxy-agent');
    const { HttpProxyAgent } = require('http-proxy-agent');
    https.globalAgent = new HttpsProxyAgent(proxyUrl);
    http.globalAgent = new HttpProxyAgent(proxyUrl);
  } catch (e) {
    console.warn('[proxy] http/https 全局代理初始化失败:', e.message);
  }

  console.log('[proxy] 出站代理已启用:', proxyUrl);
  return proxyUrl;
}

module.exports = { setupOutboundProxy };
