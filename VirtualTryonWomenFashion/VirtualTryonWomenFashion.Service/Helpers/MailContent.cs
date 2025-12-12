using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.Helpers
{
    public static class MailContent
    {
       
        public static string ConfirmAccountEmail(string fullName, string tokenConfirm, string email, string baseUrl)
        {
            
            string url = baseUrl + "/confirm-email?token="
                 + Uri.EscapeDataString(tokenConfirm)
                 + "&email=" + Uri.EscapeDataString(email);

            return "<div style=\"background-color:#f8f8f8;font-family:sans-serif;padding:15px\">\n"
                + "        <div style=\"max-width:1000px ; margin:auto\">\n"
                + "            <div class=\"adM\">\n"
                + "                <div style=\"background-color:#fff;padding:5px 20px;color:#000;border-radius:0px 0px 2px 2px\">\n"
                + "                    <div style=\"padding:35px 15px\">\n"
                + "                        <p style=\"margin:0;font-size:16px\">\n"
                + "                            <b>Hello, " + fullName + " </b>\n"
                + "                        </p>\n"
                + "                        <br>\n"
                + "                        <p style=\"margin:0;font-size:16px\">\n"
                + "                            You have just registered an account, please click the button below to confirm your account at\n"
                + "                            <a style=\"text-decoration:none\\\\\" href=\"Women Fashion\\\\\"\n"
                + "                                target=\"_blank\">Women Fashion</a>\n"
+ "                                          </p>\n"
                + "                        <div style=\"padding:40px;margin:auto;text-align:center\">\n"
                + "                            <a href=\"" + url + "\" style=\"color: #3cc892; text-decoration: none;\">\n"
                + "                                <div style=\"width:fit-content;border:#3cc892 thin solid;color:#3cc892;font-weight:bold;text-align:center;padding:7px 12px;border-radius:2px;margin:auto;font-size:large\">\n"
                + "                                    CONFIRM\n"
                + "                                </div>\n"
                + "                            </a>\n"
                + "                        </div>\n"
                + "                        <div style=\"border-top:1px solid #dcdbdb\"></div>\n"
                + "                        <br>\n"
                + "                        <p style=\"margin:0;font-size:16px\">Best Regards,</p>\n"
                + "                        <p style=\"margin:0;font-size:16px\">Women Fashion</p>\n"
                + "                    </div>\n"
                + "                </div>\n"
                + "            </div>\n"
                + "        </div>\n"
                + "    </div>";
        }
        public static string OrderSuccessEmail(
            string fullName,
            string orderCode,
            string orderDate,
            string totalPrice,
            string shippingAddress
        )
        {
            return $@"
<div style='background-color:#f4f4f7;font-family:Arial, sans-serif;padding:20px'>
    <div style='max-width:750px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;
        box-shadow:0 4px 15px rgba(0,0,0,0.1)'>

        <div style='background:linear-gradient(135deg,#3cc892,#2ba57c);padding:25px;text-align:center;color:white;'>
            <h1 style='margin:0;font-size:28px;font-weight:700;'>🎉 ĐẶT HÀNG THÀNH CÔNG!</h1>
            <p style='margin:5px 0 0;font-size:16px;opacity:0.9;'>Cảm ơn bạn đã mua sắm tại Women Fashion</p>
        </div>

        <div style='padding:35px 25px;color:#333;font-size:16px;line-height:1.6;'>

            <p style='margin:0;'>Xin chào <b>{fullName}</b>,</p>
            <p>Đơn hàng của bạn đã được <b style='color:#3cc892;'>đặt thành công</b> và chúng tôi đang xử lý để chuẩn bị giao đến bạn.</p>

            <div style='margin:25px 0;padding:20px;background:#f9f9f9;border-left:4px solid #3cc892;
                border-radius:4px;'>
                <p style='margin:0;font-size:17px;'><b>Thông tin đơn hàng</b></p>
                <p style='margin:5px 0;'>📌 <b>Mã đơn hàng:</b> {orderCode}</p>
                <p style='margin:5px 0;'>📅 <b>Ngày đặt:</b> {orderDate}</p>
                <p style='margin:5px 0;'>💵 <b>Tổng tiền:</b> {totalPrice}</p>
            </div>

            <h3 style='margin-top:30px;margin-bottom:10px;font-size:20px;'>📦 Địa chỉ giao hàng</h3>
            <div style='padding:15px;background:#f9f9f9;border-radius:4px;'>
                {shippingAddress}
            </div>

            <p style='margin-top:40px;'>
                Nếu bạn có bất kỳ thắc mắc nào, vui lòng liên hệ với đội ngũ hỗ trợ của chúng tôi để được giải đáp nhanh nhất.
            </p>
            <p style='margin:0;'>Trân trọng,<br><b>Women Fashion</b></p>
        </div>

        <div style='background:#f1f1f1;padding:15px;text-align:center;font-size:14px;color:#777;'>
            © 2025 Women Fashion. Mọi quyền được bảo lưu.
        </div>
    </div>
</div>";
        }

        public static string ResetPasswordEmail(
    string fullName,
    string tokenReset,
    string email,
    string baseUrl
)
        {
            string url = baseUrl + "/reset-password?token="
                 + Uri.EscapeDataString(tokenReset)
                 + "&email=" + Uri.EscapeDataString(email);

            return $@"
            <div style='background-color:#f4f4f7;font-family:Arial, sans-serif;padding:20px'>
                <div style='max-width:750px;margin:auto;background:#ffffff;border-radius:8px;overflow:hidden;
                    box-shadow:0 4px 15px rgba(0,0,0,0.1)'>

                    <div style='background:linear-gradient(135deg,#3cc892,#2ba57c);padding:25px;text-align:center;color:white;'>
                        <h1 style='margin:0;font-size:28px;font-weight:700;'>RESET PASSWORD</h1>
                        <p style='margin:5px 0 0;font-size:16px;opacity:0.9;'>Yêu cầu đặt lại mật khẩu cho tài khoản của bạn</p>
                    </div>

                    <div style='padding:35px 25px;color:#333;font-size:16px;line-height:1.6;'>

                        <p style='margin:0;'>Xin chào <b>{fullName}</b>,</p>
                        <p>Bạn vừa yêu cầu đặt lại mật khẩu cho tài khoản Women Fashion.  
                           Vui lòng nhấn nút bên dưới để tiến hành đặt lại mật khẩu.</p>

                        <div style='padding:40px;text-align:center;'>
                            <a href='{url}' style='color:#ffffff;text-decoration:none;'>
                                <div style='width:fit-content;background:#3cc892;color:#fff;font-weight:bold;
                                    padding:12px 22px;border-radius:4px;font-size:18px;margin:auto;'>
                                    RESET PASSWORD
                                </div>
                            </a>
                        </div>

                        <div style='border-top:1px solid #e5e5e5;margin-top:25px;margin-bottom:25px;'></div>

                        <p style='font-size:15px;color:#555;'>
                            Nếu bạn không yêu cầu hành động này, hãy bỏ qua email này.  
                            Tài khoản của bạn sẽ vẫn an toàn.
                        </p>

                        <p style='margin-top:35px;margin-bottom:0;'>Trân trọng,<br><b>Women Fashion</b></p>
                    </div>

                    <div style='background:#f1f1f1;padding:15px;text-align:center;font-size:14px;color:#777;'>
                        © 2025 Women Fashion. Mọi quyền được bảo lưu.
                    </div>
                </div>
            </div>";
        }

        public static string WithdrawRequestApproved(
    string fullName,
    decimal money,
    string bankName,
    string bankAccountNumber,
    string transactionCode)
        {

            return "<div style=\"background-color:#f8f8f8;font-family:sans-serif;padding:15px\">\n"
                + "    <div style=\"max-width:1000px; margin:auto\">\n"
                + "        <div style=\"background-color:#fff;padding:5px 20px;color:#000;border-radius:2px\">\n"
                + "            <div style=\"padding:35px 15px\">\n"
                + "                <p style=\"margin:0;font-size:16px\">\n"
                + "                    <b>Hello, " + fullName + "</b>\n"
                + "                </p>\n"
                + "                <br>\n"
                + "                <p style=\"margin:0;font-size:16px;line-height:1.6\">\n"
                + "                    Yêu cầu rút tiền của bạn đã được <b>Admin chấp nhận</b> và đang được xử lý.\n"
                + "                    <br>Admin sẽ tiến hành chuyển tiền cho bạn thông qua phương thức rút mà bạn đã cung cấp.\n"
                + "                </p>\n"
                + "                <br>\n"
                + "                <p style=\"margin:0;font-size:16px;line-height:1.6\">\n"
                + "                    <b>Số tiền rút:</b> " + money.ToString("N0") + " VND<br>\n"
                + "                    <b>Ngân hàng:</b> " + bankName + "<br>\n"
                + "                    <b>Số tài khoản:</b> " + bankAccountNumber + "<br>\n"
                + "                    <b>Mã giao dịch:</b> #" + transactionCode + "\n"
                + "                </p>\n"
                + "                <div style=\"border-top:1px solid #dcdbdb\"></div>\n"
                + "                <br>\n"
                + "                <p style=\"margin:0;font-size:16px\">Trân trọng,</p>\n"
                + "                <p style=\"margin:0;font-size:16px\">Women Fashion</p>\n"
                + "            </div>\n"
                + "        </div>\n"
                + "    </div>\n"
                + "</div>";
        }

    }

}
