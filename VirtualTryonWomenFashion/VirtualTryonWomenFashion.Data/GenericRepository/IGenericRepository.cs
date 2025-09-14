using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;

namespace VirtualTryonWomenFashion.Data.GenericRepository
{
    public interface IGenericRepository<TEntity> where TEntity : class
    {
        Task<List<TEntity>> GetAll(
            PaginationParameter? pagination = null,
            Expression<Func<TEntity, bool>>? filter = null,
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
            params Expression<Func<TEntity, object>>[] includes); // Optional parameter for pagination (number of records per page)
        Task<TEntity> GetByIdAsync(object id);
        TEntity GetById(object id);

        Task InsertAsync(TEntity entity);
        Task InsertAsync(IEnumerable<TEntity> entities);
        Task UpdateAsync(TEntity entity);
        Task Delete(TEntity entityToDelete);
        int Count(Expression<Func<TEntity, bool>>? filter = null);

    }
}
