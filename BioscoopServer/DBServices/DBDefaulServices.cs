using Microsoft.EntityFrameworkCore;

public abstract class DBDefaultService<TEntity> where TEntity : class
{
    protected readonly DbContext _context;
    protected readonly DbSet<TEntity> _dbSet;

    public DBDefaultService(DbContext context)
    {
        _context = context;
        _dbSet = _context.Set<TEntity>();
    }

    public abstract bool Exists(TEntity entity, out TEntity? existing);

    public virtual Task<bool> Valid(TEntity entity)
    {
        return Task.FromResult(true);
    }

    public virtual async Task<List<TEntity>> GetAllAsync()
    {
        return await _dbSet.AsNoTracking().ToListAsync();
    }
    public virtual async Task<TEntity?> GetByIdAsync(object id)
    {
        return await _dbSet.FindAsync(id);
    }

    public virtual async Task<TEntity?> AddAsync(TEntity entity)
    {
        if (entity == null) return entity;

        if (Exists(entity, out var existing))
        {
            return existing;
        }

        await _dbSet.AddAsync(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task<TEntity?> AddValidAsync(TEntity entity)
    {
        if (entity == null) return entity;

        if (Exists(entity, out var existing))
        {
            return existing;
        }

        if (await Valid(entity))
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        return null;
    }

    public virtual async Task<TEntity> UpdateAsync(TEntity entity)
    {
        _dbSet.Update(entity);
        await _context.SaveChangesAsync();
        return entity;
    }

    public virtual async Task<TEntity?> UpdateValidAsync(TEntity entity)
    {
        if (entity == null) return entity;

        if (!Exists(entity, out var existing))
        {
            return existing;
        }

        if (await Valid(entity))
        {
            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        return null;
    }

    public virtual async Task<TEntity?> AddOrUpdateAsync(TEntity entity)
    {
        if (entity == null) return entity;

        if (Exists(entity, out var existing))
        {
            if (existing == null) return existing;

            _dbSet.Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }
        else
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }
    }

    public virtual async Task DeleteAsync(TEntity entity)
    {
        _dbSet.Remove(entity);
        await _context.SaveChangesAsync();
    }
}
