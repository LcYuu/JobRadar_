import Swal from 'sweetalert2';
import { logoutAction } from '../redux/Auth/auth.thunk';

let inactivityTimeout = null;

export const startInactivityTimer = (dispatch, warningTime = 55 * 60 * 1000, logoutTime = 60 * 60 * 1000) => {

  const resetTimer = () => {
    // Nếu đã có bộ đếm, hủy nó
    if (inactivityTimeout) {
      clearTimeout(inactivityTimeout);
    }
    // Thiết lập cảnh báo trước khi đăng xuất
    inactivityTimeout = setTimeout(() => {
      Swal.fire({
        title: 'Thông báo',
        text: 'Bạn đã không hoạt động trong một thời gian dài. Phiên của bạn sẽ hết hạn sau 30 giây.',
        icon: 'warning',
        showConfirmButton: true,
        confirmButtonText: 'Tiếp tục hoạt động',
      }).then(result => {
        if (result.isConfirmed) {
          // Khi người dùng nhấn "OK", reset lại bộ đếm và tiếp tục theo dõi hoạt động
          resetTimer();
        }
      });

      // Đặt thêm bộ đếm để đăng xuất sau 5 phút (tính từ lúc cảnh báo xuất hiện)
      inactivityTimeout = setTimeout(() => {
        dispatch(logoutAction());
        Swal.fire({
          title: 'Hết phiên làm việc',
          text: 'Phiên của bạn đã hết hạn. Bạn đã được đăng xuất.',
          icon: 'info',
          confirmButtonText: 'OK',
        }).then(() => {
          // Sau khi người dùng nhấn "OK", thực hiện logout ngay lập tức
          dispatch(logoutAction());
        });
      }, logoutTime - warningTime);
    }, warningTime);
  };

  // Lắng nghe các sự kiện hoạt động của người dùng
  const events = ['mousemove', 'keydown', 'scroll', 'click'];
  events.forEach(event => window.addEventListener(event, resetTimer));

  // Đặt bộ đếm ban đầu
  resetTimer();

  // Hàm để dọn dẹp (clear) các listener
  return () => {
    events.forEach(event => window.removeEventListener(event, resetTimer));
    clearTimeout(inactivityTimeout);
  };
};
