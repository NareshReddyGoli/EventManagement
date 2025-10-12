const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
if (process.env.CLOUDINARY_CLOUD_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Upload base64 image to Cloudinary
 * @param {string} base64String - Base64 encoded image
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<string>} - URL of uploaded image
 */
async function uploadBase64Image(base64String, folder = 'event-memories') {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.log('[Cloudinary] Not configured. Returning mock URL.');
    return `https://via.placeholder.com/800x600?text=Mock+Image`;
  }

  try {
    const result = await cloudinary.uploader.upload(base64String, {
      folder: folder,
      resource_type: 'auto'
    });

    return result.secure_url;
  } catch (error) {
    console.error('[Cloudinary] Upload error:', error.message);
    throw new Error(`Failed to upload image: ${error.message}`);
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image
 * @returns {Promise<object>} - Deletion result
 */
async function deleteImage(publicId) {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    console.log('[Cloudinary] Not configured. Mock deletion.');
    return { result: 'ok', mock: true };
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('[Cloudinary] Delete error:', error.message);
    throw new Error(`Failed to delete image: ${error.message}`);
  }
}

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string} - Public ID
 */
function extractPublicId(url) {
  if (!url) return null;
  
  const parts = url.split('/');
  const filename = parts[parts.length - 1];
  const publicId = filename.split('.')[0];
  
  // Include folder path if exists
  const folderIndex = parts.indexOf('upload') + 1;
  if (folderIndex > 0 && folderIndex < parts.length - 1) {
    const folders = parts.slice(folderIndex, -1).join('/');
    return `${folders}/${publicId}`;
  }
  
  return publicId;
}

module.exports = {
  uploadBase64Image,
  deleteImage,
  extractPublicId
};





