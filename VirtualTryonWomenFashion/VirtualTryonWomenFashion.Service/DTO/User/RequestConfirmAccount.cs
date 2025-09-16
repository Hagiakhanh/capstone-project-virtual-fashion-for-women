using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.User
{
    public class RequestConfirmAccount
    {
        public string Email { get; set; }
        public string ConfirmToken { get; set; }
    }
}
