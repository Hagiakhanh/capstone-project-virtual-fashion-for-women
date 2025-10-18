using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System;
using System.ComponentModel.DataAnnotations;

namespace VirtualTryonWomenFashion.Service.DTO.Characteristic
{
    public class RequestCreateUserCharacteristics
        {
            [Range(30, 200, ErrorMessage = "Cân nặng phải nằm trong khoảng từ 30kg đến 200kg.")]
            public double? Weight { get; set; }

            [Range(10, 100, ErrorMessage = "Tuổi phải nằm trong khoảng từ 10 đến 100.")]
            public int? Age { get; set; }

            [Range(100, 250, ErrorMessage = "Chiều cao phải nằm trong khoảng từ 100cm đến 250cm.")]
            public double? Height { get; set; }

            [Required(ErrorMessage = "Vui lòng chọn kiểu phong cách (Style Type).")]
            public int? StyleTypeID { get; set; }

            [StringLength(200, ErrorMessage = "Ghi chú về phong cách không được vượt quá 200 ký tự.")]
            public string? StyleTypeNote { get; set; }

            [Required(ErrorMessage = "Vui lòng chọn sở thích dịp sử dụng (Occasion Preference).")]
            public int? OccasionPreferenceID { get; set; }

            [StringLength(200, ErrorMessage = "Ghi chú về dịp sử dụng không được vượt quá 200 ký tự.")]
            public string? OccasionPreferenceNote { get; set; }

            [Required(ErrorMessage = "Vui lòng chọn tông da (Skin Tone).")]
            public int? SkinToneID { get; set; }

            [StringLength(200, ErrorMessage = "Ghi chú về tông da không được vượt quá 200 ký tự.")]
            public string? SkinToneNote { get; set; }
        }
    }
