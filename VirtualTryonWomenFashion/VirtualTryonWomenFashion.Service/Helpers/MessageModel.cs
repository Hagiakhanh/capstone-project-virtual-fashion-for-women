using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.Helpers
{
    public class MessageModel
    {
        public string Message { get; set; }
        public int StatusCode { get; set; }
    }

    public class MessageModelWithData<T>
    {
        public string Message { get; set; }
        public int StatusCode { get; set; }
        public T Data { get; set; }
    }
}
