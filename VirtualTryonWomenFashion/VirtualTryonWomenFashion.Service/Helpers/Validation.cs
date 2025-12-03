using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.Helpers
{
    public class PhoneVNAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            if (value == null || string.IsNullOrWhiteSpace(value.ToString()))
            {
                return ValidationResult.Success;
            }

            string phone = value.ToString()!.Trim().Replace(" ", "").Replace("-", "");
            string pattern = @"^((\+84|84|0)(3[0-9]|5[0-9]|7[0-9]|8[0-9]|9[0-9]))[0-9]{7}$";

            if (!Regex.IsMatch(phone, pattern))
            {
                return new ValidationResult("Định dạng số điện thoại phải là Việt Nam");
            }

            return ValidationResult.Success;
        }
    }
}
