import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();


// =====================================================
// CONFIGURATION DE CLOUDINARY
// =====================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// =====================================================
// UPLOAD D'UN FICHIER VERS CLOUDINARY
// =====================================================

export const uploadToCloudinary = async (filePath, folder) => {

  const result = await cloudinary.uploader.upload(filePath, {
    folder: `gestion-stages/${folder}`,
    resource_type: 'auto',
  });

  return result.secure_url;
};


export default cloudinary;

