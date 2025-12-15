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
            return @"<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f0f2f5; }
        .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
        .header p { margin: 10px 0 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 40px 30px; }
        .status-box { background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%); padding: 20px; border-radius: 6px; margin-bottom: 30px; color: #2d5f2e; text-align: center; }
        .status-box p { margin: 0; font-size: 16px; font-weight: 600; }
        .info-section { margin-bottom: 30px; }
        .info-section h3 { margin: 0 0 20px 0; font-size: 16px; color: #333; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .info-item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee; }
        .info-item:last-child { border-bottom: none; }
        .info-label { color: #666; font-weight: 500; font-size: 14px; }
        .info-value { color: #333; font-weight: 600; font-size: 14px; word-break: break-all; text-align: right; margin-left: 20px; }
        .success-icon { font-size: 32px; margin-bottom: 10px; }
        .description { color: #555; font-size: 15px; line-height: 1.6; margin-bottom: 20px; }
        .footer { background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #eee; }
        .footer p { margin: 8px 0; color: #666; font-size: 14px; }
        .brand { color: #667eea; font-weight: 600; font-size: 16px; }
        .divider { height: 3px; background: linear-gradient(90deg, #667eea 0%, #764ba2 100%); margin: 30px 0; }
        .note { background-color: #fef3cd; border-left: 4px solid #ffc107; padding: 15px; margin-top: 30px; border-radius: 4px; }
        .note p { margin: 0; color: #856404; font-size: 13px; line-height: 1.5; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>✓ Yêu Cầu Rút Tiền Được Chấp Nhận</h1>
            <p>Giao dịch của bạn đang được xử lý</p>
        </div>
        
        <div class='content'>
            <p style='margin: 0 0 20px 0; font-size: 16px;'>Xin chào <strong>" + fullName + @"</strong>,</p>
            
            <div class='status-box'>
                <div class='success-icon'>✓</div>
                <p>Yêu cầu rút tiền của bạn đã được Admin chấp nhận</p>
            </div>
            
            <p class='description'>
                Chúng tôi vui mừng thông báo rằng yêu cầu rút tiền của bạn đã được xét duyệt thành công. 
                Quản trị viên sẽ tiến hành chuyển tiền tới tài khoản ngân hàng của bạn trong thời gian sớm nhất.
            </p>
            
            <div class='info-section'>
                <h3>Chi Tiết Giao Dịch</h3>
                <div class='info-item'>
                    <span class='info-label'>Số tiền rút</span>
                    <span class='info-value'>" + money.ToString("N0") + @" VND</span>
                </div>
                <div class='info-item'>
                    <span class='info-label'>Ngân hàng</span>
                    <span class='info-value'>" + bankName + @"</span>
                </div>
                <div class='info-item'>
                    <span class='info-label'>Số tài khoản</span>
                    <span class='info-value'>" + bankAccountNumber + @"</span>
                </div>
                <div class='info-item'>
                    <span class='info-label'>Mã giao dịch</span>
                    <span class='info-value'>#" + transactionCode + @"</span>
                </div>
            </div>
            
            <div class='note'>
                <p><strong>Lưu ý:</strong> Vui lòng giữ mã giao dịch để phục vụ cho việc theo dõi. Nếu có bất kỳ thắc mắc, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.</p>
            </div>
        </div>
        
        <div class='footer'>
            <p>Cảm ơn bạn đã tin tưởng chúng tôi!</p>
            <p class='brand'>Women Fashion</p>
            <p style='margin-top: 15px; font-size: 12px; color: #999;'>
                © 2024 Women Fashion. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>";
        }
    }
}
