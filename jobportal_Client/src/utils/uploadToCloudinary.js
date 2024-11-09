const cloud_name = "ddqygrb0g";
const upload_preset = "GiaThuan";

export const uploadToCloudinary = async (file) => {
    if (file) {
        const data = new FormData();
        data.append("file", file);
        data.append("upload_preset", upload_preset);
        data.append("cloud_name", cloud_name);

        // Tự động xác định fileType dựa trên loại file
        const fileType = file.type.startsWith("image/") ? "image" : "raw";

        const res = await fetch(
            `https://api.cloudinary.com/v1_1/${cloud_name}/${fileType}/upload`,
            { method: "post", body: data }
        );

        const fileData = await res.json();
        console.log("Uploaded File URL:", fileData.url);

        return fileData.url;
    } else {
        console.log("Error: Missing file...");
    }
};
