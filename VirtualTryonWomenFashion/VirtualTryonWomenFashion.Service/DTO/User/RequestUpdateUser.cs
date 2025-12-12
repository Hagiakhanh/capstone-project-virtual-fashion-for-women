using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.User
{
    public class RequestUpdateUser
    {
        [Required]
        public string FullName { get; set; }
        [RegularExpression(@"^(\d{10})?$", ErrorMessage = "Số điện thoại phải có đúng 10 chữ số.")]
        public string? PhoneNumber { get; set; }

        public string? Address { get; set; }
        public string? SecondAddress { get; set; }
    }
}
