using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.Transaction
{
    public class TransactionInformation
    {
        public int TransactionId { get; set; }

        public int UserId { get; set; }

        public int OrderId { get; set; }

        public string Status { get; set; }

        public decimal? Money { get; set; }

        public string Method { get; set; }

        public string TransactionCode { get; set; }

        public DateTime UpdatedAt { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
