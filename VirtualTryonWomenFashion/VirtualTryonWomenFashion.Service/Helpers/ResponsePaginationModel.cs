using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.Helpers
{
    public class ResponsePaginationModel<T>
    {
        public int StatusCode { get; set; }
        public string? Message { get; set; }
        public T Data { get; set; }
        public int? TotalRecords { get; set; } = 0;
        public int? TotalPages { get; set; } = 0;
        public ResponsePaginationModel(int statusCode, T data, string? message)
        {
            StatusCode = statusCode;
            Message = message;
            Data = data;
        }
        public ResponsePaginationModel(int statusCode, T data, int? totalRecords, int? totalPages)
        {
            StatusCode = statusCode;
            Data = data;
            TotalRecords = totalRecords;
            TotalPages = totalPages;

        }
    }
}
