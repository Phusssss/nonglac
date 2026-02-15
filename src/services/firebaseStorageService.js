import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import { storage } from '../firebase/config';

const DEFAULT_ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const DEFAULT_ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo',
  'video/x-ms-wmv',
  'video/x-matroska'
];
const DEFAULT_OPTIONS = {
  folder: 'images',
  maxSizeMB: 10,
  maxWidth: 1600,
  maxHeight: 1600,
  quality: 0.82,
  outputType: 'image/jpeg',
  keepOriginalFormat: false
};

const sanitizeFileName = (fileName = 'image.jpg') => {
  const name = String(fileName);
  return name
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
};

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const loadImageFromFile = (file) => new Promise((resolve, reject) => {
  const image = new Image();
  const objectUrl = URL.createObjectURL(file);

  image.onload = () => {
    URL.revokeObjectURL(objectUrl);
    resolve(image);
  };

  image.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('Cannot decode image file'));
  };

  image.src = objectUrl;
});

const canvasToBlob = (canvas, mimeType, quality) => new Promise((resolve, reject) => {
  canvas.toBlob((blob) => {
    if (!blob) {
      reject(new Error('Cannot encode image after scaling'));
      return;
    }
    resolve(blob);
  }, mimeType, quality);
});

const getScaledDimensions = (width, height, maxWidth, maxHeight) => {
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const scale = Math.min(maxWidth / width, maxHeight / height);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale))
  };
};

const loadVideoFromFile = (file) => new Promise((resolve, reject) => {
  const video = document.createElement('video');
  const objectUrl = URL.createObjectURL(file);

  video.preload = 'metadata';
  video.muted = true;
  video.playsInline = true;

  video.onloadedmetadata = () => {
    resolve({ video, objectUrl });
  };

  video.onerror = () => {
    URL.revokeObjectURL(objectUrl);
    reject(new Error('Cannot decode video file'));
  };

  video.src = objectUrl;
});

const getSupportedRecorderMimeType = () => {
  if (typeof MediaRecorder === 'undefined') return '';
  const candidates = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4'
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || '';
};

const transcodeVideo = async (file, options = {}) => {
  const {
    maxWidth = 854,
    maxHeight = 480,
    videoBitsPerSecond = 620000,
    fps = 24
  } = options;

  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    throw new Error('MediaRecorder is not supported on this browser');
  }

  const mimeType = getSupportedRecorderMimeType();
  if (!mimeType) {
    throw new Error('No supported video mime type for compression');
  }

  const { video, objectUrl } = await loadVideoFromFile(file);
  const streamFromVideo = video.captureStream?.() || video.mozCaptureStream?.();
  if (!streamFromVideo) {
    URL.revokeObjectURL(objectUrl);
    throw new Error('Video captureStream is not supported');
  }

  const { width, height } = getScaledDimensions(
    video.videoWidth || maxWidth,
    video.videoHeight || maxHeight,
    maxWidth,
    maxHeight
  );

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) {
    URL.revokeObjectURL(objectUrl);
    throw new Error('Cannot initialize video canvas');
  }

  const canvasStream = canvas.captureStream(fps);
  (streamFromVideo.getAudioTracks?.() || []).forEach((audioTrack) => {
    try {
      canvasStream.addTrack(audioTrack);
    } catch (error) {
      // Ignore if browser blocks adding audio track to canvas stream.
    }
  });

  const chunks = [];
  const recorder = new MediaRecorder(canvasStream, {
    mimeType,
    videoBitsPerSecond
  });

  const stopPromise = new Promise((resolve, reject) => {
    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    recorder.onerror = (event) => {
      reject(new Error(event?.error?.message || 'Video recorder error'));
    };
    recorder.onstop = () => {
      resolve();
    };
  });

  let rafId = null;
  const drawFrame = () => {
    if (!video.paused && !video.ended) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      rafId = requestAnimationFrame(drawFrame);
    }
  };

  recorder.start(250);
  await video.play();
  drawFrame();

  await new Promise((resolve) => {
    video.onended = resolve;
  });

  if (rafId) {
    cancelAnimationFrame(rafId);
  }

  if (recorder.state !== 'inactive') {
    recorder.stop();
  }
  await stopPromise;

  URL.revokeObjectURL(objectUrl);
  streamFromVideo.getTracks().forEach((track) => track.stop());
  canvasStream.getTracks().forEach((track) => track.stop());

  const blob = new Blob(chunks, { type: mimeType });
  const extension = mimeType.includes('mp4') ? 'mp4' : 'webm';
  const processedFile = new File([blob], `${file.name.replace(/\.[^.]+$/, '')}_compressed.${extension}`, {
    type: mimeType
  });

  return {
    file: processedFile,
    width,
    height,
    mimeType
  };
};

const buildCompressionPresets = (originalSize, maxSizeBytes) => {
  const pressure = originalSize / maxSizeBytes;
  const baseScale = clamp(Math.sqrt(1 / Math.max(pressure, 1)) * 0.95, 0.4, 1);

  return [
    { maxWidth: 1280, maxHeight: 720, videoBitsPerSecond: 1000000, scale: baseScale },
    { maxWidth: 960, maxHeight: 540, videoBitsPerSecond: 800000, scale: clamp(baseScale * 0.88, 0.36, 1) },
    { maxWidth: 854, maxHeight: 480, videoBitsPerSecond: 620000, scale: clamp(baseScale * 0.78, 0.32, 1) },
    { maxWidth: 640, maxHeight: 360, videoBitsPerSecond: 420000, scale: clamp(baseScale * 0.65, 0.28, 1) }
  ];
};

class FirebaseStorageService {
  validateImageFile(file, options = {}) {
    const { maxSizeMB = DEFAULT_OPTIONS.maxSizeMB, allowedTypes = DEFAULT_ALLOWED_TYPES } = options;

    if (!file) {
      throw new Error('Image file is required');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported image type');
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error(`Image exceeds ${maxSizeMB}MB limit`);
    }
  }

  async scaleImage(file, options = {}) {
    const merged = { ...DEFAULT_OPTIONS, ...options };
    this.validateImageFile(file, merged);

    const image = await loadImageFromFile(file);
    const { width, height } = getScaledDimensions(
      image.width,
      image.height,
      merged.maxWidth,
      merged.maxHeight
    );

    const shouldResize = width !== image.width || height !== image.height;
    const shouldTranscode = !merged.keepOriginalFormat && merged.outputType !== file.type;
    const shouldProcess = shouldResize || shouldTranscode;

    if (!shouldProcess) {
      return {
        blob: file,
        width: image.width,
        height: image.height,
        originalSize: file.size,
        processedSize: file.size
      };
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Cannot initialize image canvas');
    }

    context.drawImage(image, 0, 0, width, height);

    const quality = clamp(merged.quality, 0.1, 1);
    const mimeType = merged.keepOriginalFormat ? file.type : merged.outputType;
    const blob = await canvasToBlob(canvas, mimeType, quality);

    return {
      blob,
      width,
      height,
      originalSize: file.size,
      processedSize: blob.size
    };
  }

  async uploadImage(file, options = {}) {
    const merged = { ...DEFAULT_OPTIONS, ...options };
    const {
      folder,
      keepOriginalFormat,
      outputType,
      onProgress,
      metadata,
      fileNamePrefix
    } = merged;

    const scaled = await this.scaleImage(file, merged);
    const extensionFromOutput = (outputType || '').split('/')[1] || 'jpg';
    const extensionFromInput = (file.type || '').split('/')[1] || 'jpg';
    const extension = keepOriginalFormat ? extensionFromInput : extensionFromOutput;
    const baseName = sanitizeFileName(file.name || 'image');
    const uniqueName = `${fileNamePrefix || Date.now()}_${baseName.replace(/\.[^.]+$/, '')}.${extension}`;
    const uploadPath = `${folder}/${uniqueName}`;

    const fileRef = ref(storage, uploadPath);
    const uploadTask = uploadBytesResumable(fileRef, scaled.blob, {
      contentType: keepOriginalFormat ? file.type : outputType,
      customMetadata: metadata || {}
    });

    const snapshot = await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (state) => {
          if (typeof onProgress === 'function' && state.totalBytes > 0) {
            onProgress((state.bytesTransferred / state.totalBytes) * 100);
          }
        },
        reject,
        () => resolve(uploadTask.snapshot)
      );
    });

    const url = await getDownloadURL(snapshot.ref);
    return {
      url,
      path: uploadPath,
      originalSize: scaled.originalSize,
      uploadedSize: scaled.processedSize,
      width: scaled.width,
      height: scaled.height
    };
  }

  validateVideoFile(file, options = {}) {
    const {
      maxSizeMB = 100,
      allowedTypes = DEFAULT_ALLOWED_VIDEO_TYPES,
      allowOversizeForCompression = false,
      enforceSizeLimit = false
    } = options;

    if (!file) {
      throw new Error('Video file is required');
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error('Unsupported video type');
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (enforceSizeLimit && !allowOversizeForCompression && file.size > maxSizeBytes) {
      throw new Error(`Video exceeds ${maxSizeMB}MB limit`);
    }
  }

  async uploadVideo(file, options = {}) {
    const {
      folder = 'videos',
      maxSizeMB = 100,
      allowedTypes = DEFAULT_ALLOWED_VIDEO_TYPES,
      autoCompress = true,
      alwaysCompress = false,
      targetWidth = 854,
      targetHeight = 480,
      targetBitrate = 620000,
      strictMaxSize = false,
      onProgress,
      metadata,
      fileNamePrefix
    } = options;

    this.validateVideoFile(file, {
      maxSizeMB,
      allowedTypes,
      allowOversizeForCompression: autoCompress,
      enforceSizeLimit: strictMaxSize
    });

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    let uploadFile = file;
    let compressionInfo = null;

    if (alwaysCompress) {
      try {
        const compressed = await transcodeVideo(file, {
          maxWidth: targetWidth,
          maxHeight: targetHeight,
          videoBitsPerSecond: targetBitrate
        });
        if (compressed?.file?.size > 0 && compressed.file.size < file.size) {
          uploadFile = compressed.file;
          compressionInfo = {
            originalSize: file.size,
            compressedSize: compressed.file.size,
            ratio: Number((compressed.file.size / file.size).toFixed(3)),
            width: compressed.width,
            height: compressed.height
          };
        }
      } catch (compressionError) {
        console.warn('Forced 480p compression failed, fallback to original upload:', compressionError);
      }
    } else if (autoCompress && Number.isFinite(maxSizeBytes) && maxSizeBytes > 0 && file.size > maxSizeBytes) {
      const presets = buildCompressionPresets(file.size, maxSizeBytes);
      let compressed = null;

      try {
        for (const preset of presets) {
          const attempt = await transcodeVideo(file, {
            maxWidth: Math.round(preset.maxWidth * preset.scale),
            maxHeight: Math.round(preset.maxHeight * preset.scale),
            videoBitsPerSecond: preset.videoBitsPerSecond
          });

          compressed = attempt;
          if (attempt.file.size <= maxSizeBytes) {
            break;
          }
        }
      } catch (compressionError) {
        console.warn('Video compression failed, fallback to original upload:', compressionError);
      }

      if (strictMaxSize && (!compressed || compressed.file.size > maxSizeBytes)) {
        throw new Error(`Video is too large and could not be compressed below ${maxSizeMB}MB`);
      }

      if (compressed && compressed.file.size < file.size) {
        uploadFile = compressed.file;
        compressionInfo = {
          originalSize: file.size,
          compressedSize: compressed.file.size,
          ratio: Number((compressed.file.size / file.size).toFixed(3)),
          width: compressed.width,
          height: compressed.height
        };
      }
    }

    const fileExtMatch = (uploadFile.name || '').match(/\.([a-zA-Z0-9]+)$/);
    const extension = fileExtMatch?.[1] || (uploadFile.type || '').split('/')[1] || 'mp4';
    const baseName = sanitizeFileName(uploadFile.name || 'video');
    const uniqueName = `${fileNamePrefix || Date.now()}_${baseName.replace(/\.[^.]+$/, '')}.${extension}`;
    const uploadPath = `${folder}/${uniqueName}`;
    const fileRef = ref(storage, uploadPath);

    const uploadTask = uploadBytesResumable(fileRef, uploadFile, {
      contentType: uploadFile.type,
      customMetadata: {
        ...(metadata || {}),
        ...(compressionInfo ? {
          compressed: 'true',
          originalSize: String(file.size),
          compressedSize: String(uploadFile.size)
        } : {})
      }
    });

    const snapshot = await new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (state) => {
          if (typeof onProgress === 'function' && state.totalBytes > 0) {
            onProgress((state.bytesTransferred / state.totalBytes) * 100);
          }
        },
        reject,
        () => resolve(uploadTask.snapshot)
      );
    });

    const url = await getDownloadURL(snapshot.ref);
    return {
      url,
      path: uploadPath,
      originalSize: file.size,
      uploadedSize: uploadFile.size,
      wasCompressed: Boolean(compressionInfo),
      compression: compressionInfo
    };
  }
}

export const firebaseStorageService = new FirebaseStorageService();
export default firebaseStorageService;
