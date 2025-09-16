using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Service.DTO.Mail;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface IMailService
    {
        public Task sendEmailAsync(MailRequest mailRequest);
    }
}
