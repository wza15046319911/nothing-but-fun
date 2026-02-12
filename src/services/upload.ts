import Taro from '@tarojs/taro';
import { API_BASE_URL } from './api';

export type UploadScene = 'avatar' | 'secondhand';

export interface UploadError {
  code: string;
  retriable: boolean;
  message: string;
}

export interface UploadSuccess<T = any> {
  data: T;
  statusCode: number;
  requestId?: string;
  durationMs?: number;
}

interface UploadApiResponse<T = any> {
  success?: boolean;
  data?: T;
  message?: string;
  errorCode?: string;
  requestId?: string;
  durationMs?: number;
}

const RETRIABLE_CODES = new Set(['UPLOAD_TIMEOUT', 'UPLOAD_FAILED', 'NETWORK_ERROR']);
const RETRIABLE_STATUS_CODES = new Set([502, 503, 504]);
const MAX_RETRIES = 3;
const BASE_DELAY_MS = 800;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const withJitter = (delayMs: number) => {
  const jitter = Math.floor(Math.random() * 150);
  return delayMs + jitter;
};

const toUploadError = (error: unknown): UploadError => {
  if ((error as UploadError)?.code && typeof (error as UploadError).retriable === 'boolean') {
    return error as UploadError;
  }
  const message = error instanceof Error ? error.message : '上传失败，请稍后重试';
  return {
    code: 'UNKNOWN_ERROR',
    retriable: false,
    message,
  };
};

const parseServerResponse = <T>(res: Taro.uploadFile.SuccessCallbackResult): UploadSuccess<T> => {
  let parsed: UploadApiResponse<T>;
  try {
    parsed = JSON.parse(res.data);
  } catch (_error) {
    throw {
      code: 'INVALID_RESPONSE',
      retriable: false,
      message: '上传服务返回异常，请稍后重试',
    } satisfies UploadError;
  }

  if (res.statusCode >= 200 && res.statusCode < 300 && parsed.success !== false && parsed.data) {
    return {
      data: parsed.data,
      statusCode: res.statusCode,
      requestId: parsed.requestId,
      durationMs: parsed.durationMs,
    };
  }

  const code = parsed.errorCode || `HTTP_${res.statusCode}`;
  const message = parsed.message || '上传失败，请稍后重试';
  throw {
    code,
    retriable: RETRIABLE_CODES.has(code) || RETRIABLE_STATUS_CODES.has(res.statusCode),
    message,
  } satisfies UploadError;
};

const uploadOnce = (filePath: string): Promise<Taro.uploadFile.SuccessCallbackResult> =>
  new Promise((resolve, reject) => {
    Taro.uploadFile({
      url: `${API_BASE_URL}/file`,
      filePath,
      name: 'image',
      success: resolve,
      fail: (error) => {
        reject({
          code: 'NETWORK_ERROR',
          retriable: true,
          message: (error as any)?.errMsg || '网络异常，请稍后重试',
        } satisfies UploadError);
      },
    });
  });

export const uploadImageWithRetry = async <T = any>(
  filePath: string,
  _scene: UploadScene
): Promise<UploadSuccess<T>> => {
  let lastError: UploadError | null = null;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      const res = await uploadOnce(filePath);
      return parseServerResponse<T>(res);
    } catch (error) {
      const parsedError = toUploadError(error);
      lastError = parsedError;
      if (!parsedError.retriable || attempt === MAX_RETRIES) {
        throw parsedError;
      }
      await sleep(withJitter(BASE_DELAY_MS * attempt));
    }
  }

  throw (
    lastError || {
      code: 'UNKNOWN_ERROR',
      retriable: false,
      message: '上传失败，请稍后重试',
    }
  );
};
