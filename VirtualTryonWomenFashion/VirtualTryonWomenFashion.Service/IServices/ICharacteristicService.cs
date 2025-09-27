using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Models;
using VirtualTryonWomenFashion.Service.DTO.Characteristic;
using VirtualTryonWomenFashion.Service.Helpers;

namespace VirtualTryonWomenFashion.Service.IServices
{
    public interface ICharacteristicService
    {
        public Task<MessageModelWithData<Characteristic>> CreateCharacteristic(RequestCreateUserCharacteristics requestModel);

        public Task<MessageModelWithData<Characteristic>> GetDetailCharacteristicByID(int id);
        public string GetCharacteristicDescription(Characteristic c);
    }
}
