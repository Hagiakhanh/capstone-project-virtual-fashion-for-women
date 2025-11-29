using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.User
{
    public class RequestForgotPassword
    {
        [Required(ErrorMessage = "Email is required"), EmailAddress(ErrorMessage = "Must be email format")]
        public string Email { get; set; }
    }
}
