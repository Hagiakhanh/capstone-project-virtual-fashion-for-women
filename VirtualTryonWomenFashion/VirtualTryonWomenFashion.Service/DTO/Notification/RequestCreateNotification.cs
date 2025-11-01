using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.Notification
{
    public class RequestCreateNotification
    {
        public int ReceiverId { get; set; }

        public string Title { get; set; }

        public string Content { get; set; }
    }
}
