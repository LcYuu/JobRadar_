export const formatDate = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Kiểm tra xem date có hợp lệ không
  if (isNaN(date.getTime())) {
    return '';
  }

  // Lấy ngày, tháng, năm
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};

// Format date cho input type="date"
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().split('T')[0];
}; 