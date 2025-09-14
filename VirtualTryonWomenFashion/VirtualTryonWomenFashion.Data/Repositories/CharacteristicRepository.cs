using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.DBContext;
using VirtualTryonWomenFashion.Data.GenericRepository;
using VirtualTryonWomenFashion.Data.IRepositories;
using VirtualTryonWomenFashion.Data.Models;

namespace VirtualTryonWomenFashion.Data.Repositories
{
    public class CharacteristicRepository : GenericRepository<Characteristic>, ICharacteristicRepository
    {
        public CharacteristicRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }
    }
}
