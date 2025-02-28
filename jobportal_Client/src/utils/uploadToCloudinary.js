const cloud_name = "ddqygrb0g";
const upload_preset = "GiaThuan";

export const uploadToCloudinary = async (file) => {
  if (!file) {
    console.log("❌ Error: Không có file để upload!");
    return null;
  }

  console.log("📂 Uploading file:", file.name);
  console.log("📂 File Type:", file.type);
  console.log("📂 File Size:", file.size, "bytes");

  // Kiểm tra file có vượt quá 10MB không (tài khoản miễn phí bị giới hạn)
  const MAX_SIZE = 10 * 1024 * 1024; // 10MB
  if (file.size > MAX_SIZE) {
    console.error("❌ File vượt quá 10MB, không thể upload!");
    return null;
  }

  try {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", upload_preset);
    data.append("resource_type", "auto"); // Để Cloudinary tự xác định loại file

    const uploadURL = `https://api.cloudinary.com/v1_1/${cloud_name}/upload`;

    console.log("🚀 Upload URL:", uploadURL);

    const res = await fetch(uploadURL, {
      method: "POST",
      body: data,
    });

    const fileData = await res.json();
    console.log("🌐 Cloudinary Response:", fileData);

    if (!res.ok) {
      console.error("❌ Upload failed! Status:", res.status, res.statusText);
      console.error("❌ Error details:", fileData);
      return null;
    }

    console.log("✅ Uploaded File URL:", fileData.secure_url);
    return fileData.secure_url;
  } catch (error) {
    console.error("❌ Lỗi khi upload lên Cloudinary:", error);
    return null;
  }
};
