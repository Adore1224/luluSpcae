import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import { lookup } from 'node:dns/promises';
import { readFileSync, writeFileSync } from 'node:fs';
import { request } from 'node:https';
import { BlockList } from 'node:net';
import { resolve } from 'node:path';
import { httpError } from './workbench.js';

const reserved = new BlockList();
for (const [address, prefix] of [
  ['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16],
  ['172.16.0.0', 12], ['192.0.0.0', 24], ['192.0.2.0', 24], ['192.168.0.0', 16],
  ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 4], ['240.0.0.0', 4],
]) reserved.addSubnet(address, prefix);

const moonshotHosts = new Set(['api.moonshot.cn', 'api.moonshot.ai']);

export function compatibleModelId(endpoint, input) {
  if (moonshotHosts.has(new URL(endpoint).hostname) && /^kimi k3\.1 pro$/i.test(input)) return 'kimi-k3.1-pro';
  return input;
}

function visibleTranscript(messages) {
  if (messages.length <= 2 || messages[0].role !== 'system' || messages.at(-1).role !== 'user') return messages;
  const history = messages.slice(1, -1);
  // This model requires its original reasoning payload when replaying assistant messages.
  // Supply the portable visible transcript as context for a fresh completion instead.
  return [{ ...messages[0], content: messages[0].content + '\n较近的对话记录（仅供参考）：' + JSON.stringify(history) }, messages.at(-1)];
}

export function modelEndpoint(input) {
  const url = typeof input === 'string' && input.length <= 500 ? URL.parse(input.trim()) : null;
  if (!url || url.protocol !== 'https:' || url.username || url.password || url.search || url.hash ||
    url.hostname.startsWith('[') || !url.hostname.includes('.') || reserved.check(url.hostname)) {
    throw httpError(400, '请输入公网 HTTPS 模型 API 地址，不含账号、参数或片段。');
  }
  const path = url.pathname.replace(/\/+$/, '');
  return url.origin + (path.endsWith('/chat/completions') ? path : `${path}/chat/completions`);
}

export function createModelVault(directory) {
  function secret() {
    const path = resolve(directory, 'agent-model.key');
    try { writeFileSync(path, randomBytes(32), { mode: 0o600, flag: 'wx' }); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    return readFileSync(path);
  }

  return {
    seal(value) {
      const iv = randomBytes(12);
      const cipher = createCipheriv('aes-256-gcm', secret(), iv);
      const bytes = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
      return Buffer.concat([iv, cipher.getAuthTag(), bytes]).toString('base64');
    },
    open(value) {
      const data = Buffer.from(value, 'base64');
      const cipher = createDecipheriv('aes-256-gcm', secret(), data.subarray(0, 12));
      cipher.setAuthTag(data.subarray(12, 28));
      return Buffer.concat([cipher.update(data.subarray(28)), cipher.final()]).toString('utf8');
    },
  };
}

export async function requestModel(model, key, messages, tools, options = {}) {
  const url = new URL(modelEndpoint(model.endpoint));
  let answers;
  const signal = AbortSignal.timeout(65_000);
  try {
    const aborted = new Promise((_, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
    answers = await Promise.race([lookup(url.hostname, { all: true, family: 4 }), aborted]);
  } catch {
    throw httpError(502, '无法解析模型 API 地址。');
  }
  if (!answers.length || answers.some(({ address }) => reserved.check(address))) {
    throw httpError(400, '模型 API 地址须解析到公网 IPv4。');
  }

  const modelId = compatibleModelId(url, model.model);
  const kimi = moonshotHosts.has(url.hostname) && /^kimi-k3\.1-pro(?:-highspeed)?$/.test(modelId);
  const body = JSON.stringify({
    model: modelId, messages: kimi ? visibleTranscript(messages) : messages, stream: false,
    ...(kimi && { reasoning_effort: 'low' }), ...(tools?.length && { tools, tool_choice: 'auto' }), ...options,
  });
  return new Promise((resolveResult, reject) => {
    const req = request(url, {
      method: 'POST', signal, agent: false, family: 4, autoSelectFamily: false,
      lookup: (_host, _options, callback) => callback(null, answers[0].address, 4),
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    }, (response) => {
      if (response.statusCode !== 200) {
        response.destroy();
        const hint = ({
          401: '请检查密钥及其所属平台。',
          403: '请检查账号余额、模型权限和密钥所属平台。',
          404: '请核对供应商的 Chat Completions 地址和准确的模型 ID。显示名称通常不能当作模型 ID。',
          429: '该模型已达调用额度或限速，请稍后再试。',
        })[response.statusCode] ?? '请检查连接和模型设置，或稍后重试。';
        reject(httpError(502, `模型 API 返回 HTTP ${response.statusCode}。${hint}`));
        return;
      }
      const chunks = [];
      let size = 0;
      response.on('data', (chunk) => {
        size += chunk.length;
        if (size > 1_048_576) { req.destroy(); reject(httpError(502, '模型回复过大。')); }
        else chunks.push(chunk);
      });
      response.on('error', () => reject(httpError(502, '模型回复中断。')));
      response.on('end', () => {
        let message;
        try { message = JSON.parse(Buffer.concat(chunks).toString('utf8')).choices?.[0]?.message; } catch { /* Handled below. */ }
        if (!message || (typeof message.content !== 'string' && !Array.isArray(message.tool_calls))) {
          reject(httpError(502, '模型返回的内容与 OpenAI Chat Completions 格式不兼容。'));
        } else resolveResult(message);
      });
    });
    req.on('error', () => reject(httpError(502, signal.aborted ? '模型请求超时。' : '模型 API 连接失败。')));
    req.end(body);
  });
}
