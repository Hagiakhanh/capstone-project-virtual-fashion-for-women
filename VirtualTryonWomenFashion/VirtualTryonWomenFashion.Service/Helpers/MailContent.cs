using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.Helpers
{
    public static class MailContent
    {
        public static string ConfirmAccountEmail(string fullName, string tokenConfirm, string email)
        {
            string url = "https://pre-order-blindbox-system-sp25.vercel.app/confirmemail?token="
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
                + "                                target=\"_blank\">Pre-order Blind Box</a>\n"
+ "                                          </p>\n"
                + "                        <div style=\"padding:40px;margin:auto;text-align:center\">\n"
                + "                            <a href=\"" + url + "\" style=\"color: #3cc892; text-decoration: none;\">\n"
                + "                                style=\"color: #3cc892; text-decoration: none;\">\n"
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
    }
}
