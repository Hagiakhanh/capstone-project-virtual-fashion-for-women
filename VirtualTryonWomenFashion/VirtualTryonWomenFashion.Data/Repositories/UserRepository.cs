using Microsoft.EntityFrameworkCore;
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
    public class UserRepository : GenericRepository<User>, IUserRepository
    {
        public UserRepository(VirtualTryonWomenFashionContext context) : base(context)
        {
        }

        public async Task<User> GetUserByEmail(string email)
        {
            return await _context.Users.Include(x => x.Role).SingleOrDefaultAsync(x => x.Email == email);
        }

        public async Task<User> GetUserById(int userId)
        {
            return await _context.Users.Include(x => x.Role).FirstOrDefaultAsync(x => x.UserId == userId);
        }
    }
}
