const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export async function validateUpload(file: File) { if (file.size > MAX_UPLOAD_BYTES) throw new Error("File exceeds 5 MB"); if (!file.type.startsWith("image/")) throw new Error("Only image uploads are supported"); return { name: file.name, size: file.size, type: file.type }; }
