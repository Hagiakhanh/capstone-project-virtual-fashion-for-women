using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace VirtualTryonWomenFashion.Service.DTO.Transaction
{
    public class ResponseWithDrawTransactionAdmin
    {
        public int TransactionId { get; set; }
        public string UserName { get; set; }
        public string BankName { get; set; }
        public string BankAccountNumber { get; set; }
        public string Status { get; set; }
        public decimal? Money { get; set; }
        public string Method { get; set; }
        public string Type { get; set; }
        public string ThirdPartyCode { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
