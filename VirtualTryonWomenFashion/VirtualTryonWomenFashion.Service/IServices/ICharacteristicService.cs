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
        public Task<Characteristic> GetCurrentCharacteristicForUser();
        public string GetCharacteristicDescription(Characteristic c);

        public Task<MessageModelWithData<Characteristic>> UpdateCharacteristic(RequestCreateUserCharacteristics requestModel);

    }
}
