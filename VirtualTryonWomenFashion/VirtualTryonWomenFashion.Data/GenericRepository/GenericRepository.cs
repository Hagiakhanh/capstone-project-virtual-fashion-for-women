using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;
using VirtualTryonWomenFashion.Data.Commons;
using VirtualTryonWomenFashion.Data.DBContext;

namespace VirtualTryonWomenFashion.Data.GenericRepository
{
    public class GenericRepository<TEntity> : IGenericRepository<TEntity> where TEntity : class
    {
        protected readonly VirtualTryonWomenFashionContext _context;
        protected readonly DbSet<TEntity> dbSet;
        public GenericRepository(VirtualTryonWomenFashionContext context)
        {
            _context = context;
            this.dbSet = context.Set<TEntity>();
        }

        public virtual async Task<TEntity?> GetFirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate)
        {
            return await dbSet.FirstOrDefaultAsync(predicate);
        }

        public virtual async Task<TEntity?> GetFirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, params Expression<Func<TEntity, object>>[] includes)
        {
            IQueryable<TEntity> query = dbSet;

            // Apply includes
            if (includes != null)
            {
                foreach (var include in includes)
                {
                    query = query.Include(include);
                }
            }
            return await query.FirstOrDefaultAsync(predicate);
        }


        public Task<List<TEntity>> GetAll(
            PaginationParameter? pagination = null,
            Expression<Func<TEntity, bool>>? filter = null,
            Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>>? orderBy = null,
            params Expression<Func<TEntity, object>>[] includes)  // Optional parameter for pagination (number of records per page)
        {
            IQueryable<TEntity> query = dbSet;

            if (filter != null)
            {
                query = query.Where(filter);
            }

            foreach (var includeProperty in includes)
            {
                if (includeProperty.Body is MemberExpression memberExpression)
                {
                    query = query.Include(memberExpression.Member.Name);
                }
            }

            if (orderBy != null)
            {
                query = orderBy(query);
            }
            if (pagination != null)
            {
                query = query.Skip((pagination.PageIndex - 1) * pagination.PageSize)
                    .Take(pagination.PageSize);
            }

            return query.ToListAsync();
        }
        public virtual TEntity GetById(object id)
        {
            return dbSet.Find(id);
        }
        public virtual async Task<TEntity> GetByIdAsync(object id)
        {
            return await dbSet.FindAsync(id);
        }

        public virtual async Task InsertAsync(TEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            await dbSet.AddAsync(entity);
        }
        public async Task InsertAsync(IEnumerable<TEntity> entities)
        {
            if (entities == null || !entities.Any())
                throw new ArgumentNullException(nameof(entities), "Entities list cannot be null or empty.");

            await dbSet.AddRangeAsync(entities);
        }
        public virtual void DeleteRange(IEnumerable<TEntity> entities)
        {
            if (entities == null)
                throw new ArgumentNullException(nameof(entities), "Entities list cannot be null.");

            if (!entities.Any())
                throw new ArgumentException("Entities list cannot be empty.", nameof(entities));

            foreach (var entity in entities)
            {
                if (_context.Entry(entity).State == EntityState.Detached)
                {
                    dbSet.Attach(entity);
                }
            }

            dbSet.RemoveRange(entities);
        }

        public virtual async Task UpdateAsync(TEntity entity)
        {
            if (entity == null)
                throw new ArgumentNullException(nameof(entity));

            dbSet.Attach(entity);
            _context.Entry(entity).State = EntityState.Modified;
        }

        public virtual async Task Delete(TEntity entityToDelete)
        {
            if (_context.Entry(entityToDelete).State == EntityState.Detached)
            {
                dbSet.Attach(entityToDelete);
            }
            dbSet.Remove(entityToDelete);
        }
        public virtual int Count(Expression<Func<TEntity, bool>>? filter = null)
        {
            IQueryable<TEntity> query = dbSet;
            if (filter != null)
            {
                query = query.Where(filter);

            }
            return query.Count();
        }
        public virtual async Task AddRangeAsync(IEnumerable<TEntity> entities)
        {
            if (entities == null || !entities.Any())
                throw new ArgumentNullException(nameof(entities), "Entities list cannot be null or empty.");

            await dbSet.AddRangeAsync(entities);
        }

        public virtual void AddRange(IEnumerable<TEntity> entities)
        {
            if (entities == null || !entities.Any())
                throw new ArgumentNullException(nameof(entities), "Entities list to add cannot be null or empty.");

            dbSet.AddRange(entities);
        }

        public virtual Task UpdateRangeAsync(IEnumerable<TEntity> entities)
        {
            if (entities == null || !entities.Any())
                throw new ArgumentNullException(nameof(entities), "Entities list to update cannot be null or empty.");

            dbSet.UpdateRange(entities);
            return Task.CompletedTask;
        }

        public virtual void UpdateRange(IEnumerable<TEntity> entities)
        {
            if (entities == null || !entities.Any())
                throw new ArgumentNullException(nameof(entities), "Entities list to update cannot be null or empty.");

            dbSet.UpdateRange(entities);
        }
    }
}
